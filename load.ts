import { green, yellow } from "colorette";
import fs from "fs";
import Web3 from "web3";
import { Log } from "web3-core";
import { supportedRPCs } from "./constants/crypto";
import { closeDataFile, openDataFile, pushData } from "./files";
import { MagicWeb3 } from "./MagicWeb3";
import { RPCLimits } from "./main";
import { getForSure, MetaSupabase } from "./supabase";
import { Blockchain } from "./types";
import { printMemoryUsage, restartSettings } from "./utils";

export async function loadOnChainData({
  address,
  topics,
  genesis,
  proxies,
  blockchain,
  name,
  id,
  type,
}: {
  address?: string | string[] | undefined;
  topics?: (string | string[] | null)[] | undefined;
  genesis: number;
  proxies: string[];
  name: string;
  blockchain: Blockchain;
  id: number;
  type: string;
}) {
  if (!address || address.length > 0) {
    console.log("Genesis : " + genesis);
    console.log("Addresses: " + address?.length);
    if (restartSettings.block && restartSettings.block > genesis) {
      genesis = restartSettings.block;
      console.log("Updated genesis = " + genesis);
    }
    const mode =
      address?.length && address?.length > 10000 ? "hardcore" : "default";

    const supabase = new MetaSupabase();

    const magicWeb3 = new MagicWeb3(supportedRPCs[blockchain], proxies);
    const normalWeb3 = new Web3(
      new Web3.providers.HttpProvider(supportedRPCs[blockchain][0])
    );

    const latestBlock = await getForSure(normalWeb3.eth.getBlock("latest"));
    const iterationsNeeded =
      (latestBlock.number - genesis) /
      RPCLimits[blockchain].maxRange[type][mode] /
      RPCLimits[blockchain].queriesLimit[mode] /
      (proxies.length * Math.min(supportedRPCs[blockchain].length, 2));

    if (!restartSettings.restart || !fs.existsSync("logs/" + name)) {
      console.log(
        "About to open data file",
        !restartSettings.restart,
        !fs.existsSync("logs/" + name)
      );
      openDataFile(name);
    } else {
      console.log("Not opening data file as already starting.");
    }

    console.log("Total operations needed:" + iterationsNeeded);

    for (
      let k = genesis;
      k < latestBlock.number;
      k += (latestBlock.number - genesis) / iterationsNeeded
    ) {
      console.log(yellow("=========================="));
      const calls: Promise<Log[] | void>[] = [];
      let data: (Log[] | string | void)[] = [];

      printMemoryUsage();

      let needToRecall: {
        type: string;
        fromBlock: number;
        toBlock: number;
      }[] = [];
      console.log(
        green(
          "Starting a new batch  at block " +
            Math.floor(k) +
            " on " +
            blockchain +
            " (scraping " +
            (latestBlock.number - genesis) / iterationsNeeded +
            " blocks"
        )
      );

      // console.log((address?.length || 0 > 10000 ? 'Fetching all on-chain events (old model)'  : 'Fetching only addresses events (old model)'))
      console.log(
        address
          ? address.length > 10000
            ? "Fetching all on-chain events (new model)"
            : "Fetching only addresses events (new model)"
          : "Fetching all on-chain events (new model)"
      );

      const addresses: { [index: string]: boolean } = {};

      if (address && address.length) {
        for (const entry of address) {
          addresses[entry] = true;
        }
      }

      for (
        let j = k;
        j < k + (latestBlock.number - genesis) / iterationsNeeded;
        j += RPCLimits[blockchain].maxRange[type][mode]
      ) {
        calls.push(
          new Promise((resolve) => {
            let pushed = false;

            const id = setTimeout(() => {
              if (!pushed) {
                pushed = true;
                needToRecall.push({
                  fromBlock: j,
                  toBlock: j + RPCLimits[blockchain].maxRange[type][mode],
                  type: "pair",
                });
              }
              resolve();
            }, RPCLimits[blockchain].timeout);
            magicWeb3
              .eth()
              .getPastLogs({
                fromBlock: Math.floor(j),
                toBlock: Math.floor(
                  j + RPCLimits[blockchain].maxRange[type][mode]
                ),
                address: address
                  ? address.length > 10000
                    ? undefined
                    : address
                  : undefined,
                topics,
              })
              .catch((e) => {
                if (!pushed) {
                  pushed = true;
                  needToRecall.push({
                    fromBlock: j,
                    toBlock: j + RPCLimits[blockchain].maxRange[type][mode],
                    type: "pair",
                  });
                }
              })
              .then((reply) => {
                clearTimeout(id);
                resolve(reply);
              });
          })
        );
      }

      console.log(yellow("Fetching data..."));

      let success = 0;
      let ok = 0;

      console.log("Loading data from " + calls.length + " calls");

      data = data.concat(
        (await Promise.all(calls)).map((entry, index) => {
          // @ts-ignore
          if ((entry?.length || 0) > 0) {
            success++;
            ok++;
            // @ts-ignore
            return entry.filter(
              (reply: Log) =>
                !address ||
                address === reply.address ||
                (addresses && addresses[reply.address.toLowerCase()])
            );
          } else {
            if (entry) ok++;
            return (
              k +
              index * RPCLimits[blockchain].maxRange[type][mode] +
              " (" +
              (entry ? "OK" : "ERROR") +
              ")"
            );
          }
        })
      );

      console.log(Date.now());

      console.log(
        green(
          success +
            " successful events found on this iteration (" +
            ok +
            " replied calls)"
        )
      );

      // console.log(magenta('Sleeping 3 seconds'))

      // await new Promise((resolve, reject) => setTimeout(resolve, 3000))

      let bufferRange = RPCLimits[blockchain].maxRange[type][mode];
      let iterations = 1;
      let failedIterations = 0;
      let sliced: number = 0;

      while (needToRecall.length > 0) {
        // idée : au départ, diviseur maximum qu'on peut supporter.
        // Ensuite, on itère avec ce diviseur jusqu'à ce que le nouveau diviseur
        // soit 2x plus petit et là on subdivise les blocs
        console.log(
          yellow("---------------------------------------------------")
        );

        interface LogError {
          reason: string;
          rpc: string;
        }

        const recalls: Promise<Log[] | void | LogError>[] = [];
        const blocRange = Math.floor(
          RPCLimits[blockchain].maxRange[type][mode] /
            2 /
            Math.ceil(
              (proxies.length *
                supportedRPCs[blockchain].length *
                RPCLimits[blockchain].queriesLimit[
                  address?.length && address?.length > 10000
                    ? "hardcore"
                    : "default"
                ]) /
                needToRecall.length
            )
        );
        const changingRange = bufferRange / 2 >= blocRange;
        bufferRange = changingRange ? Math.floor(bufferRange / 2) : bufferRange;
        bufferRange = bufferRange === 0 ? 1 : bufferRange;
        console.log(changingRange ? "UPDATING Range" : "Not modifying range");
        console.log("Current block range : " + bufferRange);

        if (sliced === 1) {
          needToRecall = needToRecall.slice(
            0,
            Math.ceil(needToRecall.length / 2)
          );
        } else if (sliced === 2) {
          needToRecall = needToRecall.slice(
            Math.floor(needToRecall.length / 2),
            needToRecall.length
          );
        }

        console.log(
          yellow(
            "Recalling failed calls (" +
              needToRecall.length * (changingRange ? 2 : 1) +
              ") => " +
              needToRecall.length * (changingRange ? 2 : 1) * bufferRange +
              " blocks."
          )
        );

        let tempNeedToRecall: {
          type: string;
          fromBlock: number;
          toBlock: number;
        }[] = [];

        for (let p = 0; p < needToRecall.length; p++) {
          for (
            let x = needToRecall[p].fromBlock;
            x < needToRecall[p].toBlock;
            x += bufferRange
          ) {
            if (x + bufferRange < latestBlock.number) {
              recalls.push(
                new Promise((resolve) => {
                  let pushed = false;

                  const { eth, proxy, rpc } = magicWeb3.logEth();

                  const id = setTimeout(() => {
                    if (!pushed) {
                      pushed = true;
                      tempNeedToRecall.push({
                        type: needToRecall[p].type,
                        fromBlock: x,
                        toBlock: x + bufferRange,
                      });
                    }
                    resolve({ reason: "Timeout", rpc });
                  }, RPCLimits[blockchain].timeout + iterations * RPCLimits[blockchain].timeoutPlus);

                  eth
                    .getPastLogs({
                      fromBlock: Math.floor(x),
                      toBlock: Math.floor(x + bufferRange),
                      address: address
                        ? address.length > 10000
                          ? undefined
                          : address
                        : undefined,
                      topics,
                    })
                    .catch((e) => {
                      if (!pushed) {
                        pushed = true;
                        tempNeedToRecall.push({
                          type: needToRecall[p].type,
                          fromBlock: x,
                          toBlock: x + bufferRange,
                        });

                        if (
                          e.toString() ==
                            'Error: Invalid JSON RPC response: ""' ||
                          e.toString() ==
                            'Error: Invalid JSON RPC response: {"size":0,"timeout":0}'
                        ) {
                          resolve({ reason: "Empty", rpc });
                        } else if (
                          e.toString().includes("Forbidden") ||
                          e.toString().includes("CONNECTION ERROR") ||
                          e.toString().includes("limit")
                        ) {
                          resolve({ reason: "Forbidden", rpc });
                        } else if (
                          e.toString().includes("CONNECTION TIMEOUT")
                        ) {
                          resolve({ reason: "Timeout", rpc });
                        } else if (e.toString().includes("Internal error")) {
                          resolve({ reason: "Internal", rpc });
                        } else {
                          console.log(e.toString(), proxy, rpc);
                        }
                      }
                    })
                    .then((reply) => {
                      clearTimeout(id);
                      resolve(reply);
                    });
                })
              );
            }
          }
        }

        console.log(green(`Created ${recalls.length} calls.`));

        let success = 0;
        let broken: { [index: string]: number } = {};
        let timeout: { [index: string]: number } = {};
        let empty: { [index: string]: number } = {};
        let forbidden: { [index: string]: number } = {};

        const RPCResult = (await Promise.all(recalls)).map((entry, index) => {
          // @ts-ignore
          if (typeof entry != "string" && (entry?.length || 0) > 0) {
            return entry;
          } else if (entry && "reason" in entry) {
            switch (entry.reason) {
              case "Timeout":
                if (!timeout[entry.rpc]) timeout[entry.rpc] = 1;
                timeout[entry.rpc]++;
                break;
              case "Empty":
                if (!empty[entry.rpc]) empty[entry.rpc] = 1;
                empty[entry.rpc]++;
                break;
              case "Forbidden":
                if (!forbidden[entry.rpc]) forbidden[entry.rpc] = 1;
                forbidden[entry.rpc]++;
                break;
              default:
                if (!broken[entry.rpc]) broken[entry.rpc] = 1;
                broken[entry.rpc]++;
                break;
            }
            return " (" + (typeof entry == "object" ? "OK" : "ERROR") + ")";
          }
        });

        const formattedEvents: any = [];

        for (let l = 0; l < RPCResult.length; l += 1) {
          let reply: any = null;
          if (
            RPCResult[l] &&
            (typeof RPCResult[l] != "string" ||
              (RPCResult[l] as string).includes("OK"))
          ) {
            reply = RPCResult[l];
            success++;
          }

          // console.log('Chibre', reply && typeof reply != "string")

          if (
            reply &&
            typeof reply != "string" &&
            reply.filter(
              (entry: Log) =>
                !address ||
                address === entry.address ||
                (addresses && addresses[entry.address.toLowerCase()])
            ).length > 0
          ) {
            // console.log('bushibre')
            formattedEvents.push(
              reply.filter(
                (entry: Log) =>
                  !address ||
                  address === entry.address ||
                  (addresses && addresses[entry.address.toLowerCase()])
              )
            );
          } else if (reply && typeof reply != "string") {
            // console.log('Breshi')
            // reply.filter((entry: Log) => {
            //   console.log(entry.address, (!address || address === entry.address || address?.includes(entry.address)))
            // })
          }
        }

        needToRecall = tempNeedToRecall;
        console.log(
          "Succesfully loaded " +
            formattedEvents.length +
            " events. Success: " +
            success
        );
        console.log("Need to recall : " + needToRecall.length + " left. ");
        console.log("Timeouts:", JSON.stringify(timeout));
        console.log("Forbidden:", JSON.stringify(forbidden));
        console.log("Empty:", JSON.stringify(empty));
        console.log("Broken:", JSON.stringify(broken));

        if (success === 0) failedIterations++;
        else failedIterations = 0;
        if (failedIterations === 10) {
          console.log("Looks like we are stuck... waiting 10 minutes.");
          console.info("Looks like we are stuck... waiting 10 minutes.");
          await supabase.from("assets").update({ tried: false }).match({ id });
          process.exit(10);
          // await new Promise((r) => setTimeout(r, 1000 * 60 * 10));
          // console.log("Setting sliced mode.");
          // sliced = 1;
        }

        if (sliced === 1) {
          sliced = 2;
        } else if (sliced === 2) {
          sliced = 0;
        }

        data = data.concat(formattedEvents);
        iterations++;
      }

      const separator =
        k + (latestBlock.number - genesis) / iterationsNeeded >=
        latestBlock.number;

      console.log("Separator");

      console.log(
        k + (latestBlock.number - genesis) / iterationsNeeded,
        latestBlock.number
      );

      let entries: Log[] = [];

      // console.log(data);

      data.forEach((entry) => {
        if (entry && entry.length > 0 && typeof entry != "string")
          entries = entries.concat(entry);
      });

      // console.log(entries);

      entries = entries.sort((a, b) => a.blockNumber - b.blockNumber);
      await pushData(entries, name, separator);

      printMemoryUsage();
      // await new Promise((resolve, reject) => setTimeout(resolve, 3000))
      console.log("==========================");
    }

    closeDataFile(name);
  } else {
    console.log(
      "====== NO ADDRESS FOUND (EMPTY). WRITING EMPTY DATA FILE ====="
    );
    openDataFile(name);
    closeDataFile(name);
  }
}
