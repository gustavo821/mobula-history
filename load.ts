import { green, yellow } from "colorette";
import fs from "fs";
import Web3 from "web3";
import { Log, Transaction, TransactionReceipt } from "web3-core";
import { supportedRPCs, transferEvent } from "./constants/crypto";
import { closeDataFile, openDataFile, pushData } from "./files";
import { MagicWeb3 } from "./MagicWeb3";
import { RPCLimits } from "./main";
import { getForSure, MetaSupabase } from "./supabase";
import { Blockchain } from "./types";
import { printMemoryUsage, restartSettings } from "./utils";

export async function fetchAllReceipts({
  hashes,
  collection,
  blockchain,
  proxies,
  range,
}: {
  hashes: string[];
  collection: string;
  blockchain: Blockchain;
  proxies: string[];
  range: number;
}): Promise<TransactionReceipt[]> {
  const receipts: TransactionReceipt[] = [];

  const startString = `{"data":[`;
  const endString = `]}`;

  fs.appendFileSync(`logs/${collection}-log-events.json`, startString);

  console.info("Fetching receipts for " + hashes.length + " transactions");

  const prm: Promise<any>[] = [];
  let globalSuccess = 0;
  let isFirst = true;

  for (const hash of hashes || []) {
    prm.push(
      new Promise(async (resolveTop) => {
        let finished = false;
        let errCount = 0;
        while (!finished && errCount < 15) {
          //console.info(`requesting ${hash}`);
          finished = await new Promise(async (resolve) => {
            const magicWeb3 = new MagicWeb3(supportedRPCs[blockchain], proxies);
            const TO = setTimeout(() => {
              resolve(false);
            }, 10000);
            try {
              const bufferReceipt = await magicWeb3
                .eth()
                .getTransactionReceipt(hash);
              clearTimeout(TO);
              let shouldPush = false;
              const bufferLogs: Log[] = [];
              for (const log of bufferReceipt.logs || []) {
                if (log.address.toLowerCase() != collection) {
                  if (
                    log.topics[0] == transferEvent &&
                    log.topics.length == 3
                  ) {
                    shouldPush = true;
                    bufferLogs.push(log);
                  }
                }
                let frefer;
              }
              if (shouldPush) {
                bufferReceipt.logs = bufferLogs;
                receipts.push(bufferReceipt as TransactionReceipt);
                fs.appendFileSync(
                  `logs/${collection}-log-events.json`,
                  `${isFirst ? "" : ","}${JSON.stringify(bufferReceipt)},`
                );

                isFirst = false;
              }

              globalSuccess++;
              console.info(
                `fetched: ${globalSuccess}/${hashes.length} feched receipts: ${receipts.length}`
              );
              resolve(true);
            } catch (e) {
              clearTimeout(TO);
              errCount++;
              resolve(false);
            }
          });
        }
        resolveTop(null);
      })
    );

    if (prm.length >= range) {
      console.info(`awaiting ${prm.length} promises`);
      await Promise.all(prm);
      prm.length = 0;
    }
  }

  if (prm.length > 0) {
    console.info(`awaiting ${prm.length} promises`);
    await Promise.all(prm);
    prm.length = 0;
  }

  fs.appendFileSync(`logs/${collection}-log-events.json`, endString);

  return receipts;
}

export async function fetchAllValues({
  hashes,
  collection,
  blockchain,
  proxies,
  range,
}: {
  hashes: string[];
  collection: string;
  blockchain: Blockchain;
  proxies: string[];
  range: number;
}): Promise<Transaction[]> {
  const txs: Transaction[] = [];

  const startString = `{"data":[`;
  const endString = `]}`;

  fs.appendFileSync(`logs/${collection}-tx-values.json`, startString);

  console.info("Fetching values for " + hashes.length + " transactions");

  const prm: Promise<any>[] = [];
  let globalSuccess = 0;
  let isFirst = true;

  for (const hash of hashes || []) {
    prm.push(
      new Promise(async (resolveTop) => {
        let finished = false;
        let errCount = 0;
        while (!finished && errCount < 15) {
          //console.info(`requesting ${hash}`);
          finished = await new Promise(async (resolve) => {
            const magicWeb3 = new MagicWeb3(supportedRPCs[blockchain], proxies);
            const TO = setTimeout(() => {
              resolve(false);
            }, 10000);
            try {
              const bufferTx = await magicWeb3.eth().getTransaction(hash);
              clearTimeout(TO);

              fs.appendFileSync(
                `logs/${collection}-tx-values.json`,
                `${isFirst ? "" : ","}${JSON.stringify(bufferTx)}`
              );

              isFirst = false;

              globalSuccess++;
              console.info(
                `fetched: ${globalSuccess}/${hashes.length} feched values`
              );
              resolve(true);
            } catch (e) {
              clearTimeout(TO);
              errCount++;
              resolve(false);
            }
          });
        }
        resolveTop(null);
      })
    );

    if (prm.length >= range) {
      console.info(`awaiting ${prm.length} promises`);
      await Promise.all(prm);
      prm.length = 0;
    }
  }

  if (prm.length > 0) {
    console.info(`awaiting ${prm.length} promises`);
    await Promise.all(prm);
    prm.length = 0;
  }

  fs.appendFileSync(`logs/${collection}-tx-values.json`, endString);

  return txs;
}

export async function loadOnChainData({
  address,
  topics,
  genesis,
  proxies,
  blockchain,
  name,
  id,
  type,
  dataMustContain,
}: {
  address?: string | string[] | undefined;
  topics?: (string | string[] | null)[] | undefined;
  genesis: number;
  proxies: string[];
  name: string;
  blockchain: Blockchain;
  id: number;
  type: string;
  dataMustContain?: string;
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

      if (address && address.length && typeof address !== "string") {
        for (const entry of address) {
          addresses[entry] = true;
        }
      }

      for (
        let j = k - 1;
        j + RPCLimits[blockchain].maxRange[type][mode] <
        k + (latestBlock.number - genesis) / iterationsNeeded;
        j += RPCLimits[blockchain].maxRange[type][mode]
      ) {
        calls.push(
          new Promise((resolve) => {
            let pushed = false;

            const id = setTimeout(() => {
              if (!pushed) {
                pushed = true;
                needToRecall.push({
                  fromBlock: Math.floor(j) + 1,
                  toBlock: Math.floor(
                    j + RPCLimits[blockchain].maxRange[type][mode]
                  ),
                  type: "pair",
                });
              }
              resolve();
            }, RPCLimits[blockchain].timeout);

            magicWeb3
              .eth()
              .getPastLogs({
                fromBlock: Math.floor(j) + 1,
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
                    fromBlock: Math.floor(j) + 1,
                    toBlock: Math.floor(
                      j + RPCLimits[blockchain].maxRange[type][mode]
                    ),
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
            if (dataMustContain) {
              // @ts-ignore
              return entry.filter(
                (reply: Log) =>
                  !address ||
                  address === reply.address ||
                  (address?.includes(reply.address.toLowerCase()) &&
                    (reply?.topics?.[0] == transferEvent ||
                      reply?.data?.includes(dataMustContain)))
              );
            } else {
              // @ts-ignore
              return entry.filter(
                (reply: Log) =>
                  !address ||
                  address === reply.address ||
                  address?.includes(reply.address.toLowerCase())
              );
            }
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

      if (data.length > 0) {
        let freferf;
      }

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
            x <= needToRecall[p].toBlock;
            x += bufferRange
          ) {
            if (x + bufferRange < latestBlock.number) {
              recalls.push(
                new Promise((resolve) => {
                  let pushed = false;

                  const { eth, proxy, rpc } = magicWeb3.logEth();

                  const fromBlock = x === needToRecall[p].fromBlock ? x : x + 1;
                  const toBlock =
                    x + bufferRange > needToRecall[p].toBlock
                      ? needToRecall[p].toBlock
                      : x + bufferRange;

                  if (fromBlock > toBlock) {
                    resolve([]);
                    return;
                  }

                  const id = setTimeout(() => {
                    if (!pushed) {
                      pushed = true;
                      tempNeedToRecall.push({
                        type: needToRecall[p].type,
                        fromBlock,
                        toBlock,
                      });
                    }
                    resolve({ reason: "Timeout", rpc });
                  }, RPCLimits[blockchain].timeout + iterations * RPCLimits[blockchain].timeoutPlus);

                  console.log(
                    JSON.stringify({
                      fromBlock: Math.floor(fromBlock),
                      toBlock: Math.floor(toBlock),
                    })
                  );

                  eth
                    .getPastLogs({
                      fromBlock: Math.floor(fromBlock),
                      toBlock: Math.floor(toBlock),
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
                          fromBlock,
                          toBlock,
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
                          e.toString().includes("limit") ||
                          e.toString().includes("allowed") ||
                          e.toString().includes("execute")
                        ) {
                          console.log(e.toString());
                          resolve({ reason: "Forbidden", rpc });
                        } else if (
                          e.toString().includes("CONNECTION TIMEOUT")
                        ) {
                          resolve({ reason: "Timeout", rpc });
                        } else if (e.toString().includes("Internal error")) {
                          resolve({ reason: "Internal", rpc });
                        } else if (e.toString().includes("end")) {
                          resolve({ reason: "Last block bigger", rpc });
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
            return " (ERROR)";
          } else {
            return " (OK)";
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
            !dataMustContain &&
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
          } else if (
            dataMustContain &&
            reply &&
            typeof reply != "string" &&
            reply.filter((entry: Log) => {
              !address ||
                address === entry.address ||
                (addresses &&
                  addresses[entry.address.toLowerCase()] &&
                  address?.includes(reply?.address?.toLowerCase()) &&
                  (reply?.topics?.[0] == transferEvent ||
                    reply?.data?.includes(dataMustContain)));
            }).length > 0
          ) {
            formattedEvents.push(
              reply.filter(
                (entry: Log) =>
                  !address ||
                  address === entry.address ||
                  (addresses &&
                    addresses[entry.address.toLowerCase()] &&
                    address?.includes(reply.address.toLowerCase()) &&
                    (reply?.topics?.[0] == transferEvent ||
                      reply?.data?.includes(dataMustContain)))
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

console.log("test");
