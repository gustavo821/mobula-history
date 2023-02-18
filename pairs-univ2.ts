import { green, red } from "colorette";
import fs from "fs";
import { blockchains as mobulaBlockchains } from 'mobula-utils';
import { BlockchainName } from "mobula-utils/lib/chains/model";
import { AbiItem } from "web3-utils";
import { ERC20ABI, uniswapV2ABI } from "./constants/abi";
import {
  createPairEvent
} from "./constants/crypto";
import { readLastBlock } from "./files";
import { loadOnChainData } from "./load";
import { MagicWeb3 } from "./MagicWeb3";
import { RPCLimits } from "./main";
import { Pair } from "./types";
import { getBlockToTimestamp, getTypeFromAddress, shouldLoad } from "./utils";

export async function findAllPairs(
  proxies: string[],
  contracts: string[],
  blockchains: BlockchainName[],
  id: number
): Promise<Pair[][]> {
  const crossChainFormattedPairs: any = [];
  console.log(proxies.length, "proxies loaded.");

  for (let i = 0; i < contracts.length; i++) {
    if (RPCLimits[blockchains[i]]) {
      const formattedPairs: Pair[] = [];

      if (await shouldLoad(contracts[i] + "-" + "pairs1.json")) {
        const lastBlock = await readLastBlock(
          contracts[i] + "-" + "pairs1.json"
        );
        await loadOnChainData({
          topics: [
            createPairEvent,
            null,
            "0x000000000000000000000000" + contracts[i].split("0x")[1],
          ],
          blockchain: blockchains[i],
          genesis: lastBlock,
          proxies,
          name: contracts[i] + "-" + "pairs1.json",
          id,
          type: "pairs-univ2",
        });
      }

      if (await shouldLoad(contracts[i] + "-" + "pairs0.json")) {
        const lastBlock = await readLastBlock(
          contracts[i] + "-" + "pairs0.json"
        );

        await loadOnChainData({
          topics: [
            createPairEvent,
            "0x000000000000000000000000" + contracts[i].split("0x")[1],
          ],
          blockchain: blockchains[i],
          genesis: lastBlock,
          proxies,
          name: contracts[i] + "-" + "pairs0.json",
          id,
          type: "pairs-univ2",
        });
      }

      const maybePairs = JSON.parse(
        fs.readFileSync(
          "logs/" + contracts[i] + "-" + "pairs0.json"
        ) as unknown as string
      )
        .data.concat(
          JSON.parse(
            fs.readFileSync(
              "logs/" + contracts[i] + "-" + "pairs1.json"
            ) as unknown as string
          ).data
        )
        .filter((entry: any) => entry.address);

      console.log(contracts[i] + "-" + "pairs1.json");

      const pairsIterations: Promise<null>[] = [];

      for (let zbi = 0; zbi < maybePairs.length; zbi += 500) {
        console.log("Iterating pairs " + zbi + "-" + (zbi + 500));
        for (const pair of maybePairs.slice(
          zbi,
          Math.min(zbi + 500, maybePairs.length)
        )) {
          pairsIterations.push(
            new Promise(async (resolve) => {
              let succeed = false;
              let failed = 0;
              while (!succeed && failed <= 5) {
                try {
                  const token0Address =
                    "0x" +
                    pair.topics[1]
                      .split("0x000000000000000000000000")[1]
                      .toLowerCase();

                  /**
                   * This may look a bit off, but it's because as we're creating
                   * one instance per call, we need to randomize the proxy process.
                   */

                  const decimalsToken0 = await new MagicWeb3(
                    mobulaBlockchains[blockchains[i]].rpcs[0],
                    [proxies[Math.floor(Math.random() * proxies.length)]]
                  )
                    .contract(ERC20ABI as AbiItem[], token0Address)
                    .methods.decimals()
                    .call();

                  const token1Address =
                    "0x" +
                    pair.topics[2]
                      .split("0x000000000000000000000000")[1]
                      .toLowerCase();

                  const decimalsToken1 = await new MagicWeb3(
                    mobulaBlockchains[blockchains[i]].rpcs[0],
                    [proxies[Math.floor(Math.random() * proxies.length)]]
                  )
                    .contract(ERC20ABI as AbiItem[], token1Address)
                    .methods.decimals()
                    .call();

                  console.log(green("Pushing new pair"));

                  //timestamps must be * 1000 otherwise the date will be wrong!!!!
                  const creationTimestamp = await getBlockToTimestamp(
                    new MagicWeb3(mobulaBlockchains[blockchains[i]].rpcs[0], proxies),
                    pair.blockNumber
                  );

                  let factory: string | null = null;

                  console.log("Fetching factory");
                  try {
                    factory = await new MagicWeb3(
                      mobulaBlockchains[blockchains[i]].rpcs[0],
                      [proxies[Math.floor(Math.random() * proxies.length)]]
                    )
                      .contract(
                        uniswapV2ABI as AbiItem[],
                        "0x" +
                          pair.data
                            .split("0x000000000000000000000000")[1]
                            .slice(0, 40)
                      )
                      .methods.factory()
                      .call();
                  } catch (e) {
                    console.log(e);
                  }

                  console.log("Fetched factory", factory);

                  try {
                    factory = await new MagicWeb3(
                      mobulaBlockchains[blockchains[i]].rpcs[0],
                      [proxies[Math.floor(Math.random() * proxies.length)]]
                    )
                      .contract(
                        uniswapV2ABI as AbiItem[],
                        "0x" +
                          pair.data
                            .split("0x000000000000000000000000")[1]
                            .slice(0, 40)
                      )
                      .methods.FACTORY()
                      .call();
                  } catch (e) {
                    console.log(e);
                  }

                  formattedPairs.push({
                    address:
                      "0x" +
                      pair.data
                        .split("0x000000000000000000000000")[1]
                        .slice(0, 40),
                    token0: {
                      address: token0Address,
                      type: getTypeFromAddress(token0Address.toLowerCase() as Lowercase<string>, blockchains[i]),
                      decimals: Number(decimalsToken0),
                    },
                    token1: {
                      address: token1Address,
                      type: getTypeFromAddress(token1Address.toLowerCase() as Lowercase<string>, blockchains[i]),
                      decimals: Number(decimalsToken1),
                    },
                    pairData: {
                      volumeToken0: 0,
                      volumeToken1: 0,
                      volumeUSD: 0,
                      reserve0: 0 as unknown as bigint,
                      reserve1: 0 as unknown as bigint,
                      reserveUSD: 0,
                    },
                    createdAt: creationTimestamp,
                    createdAtBlock: Number(pair.blockNumber),
                    priceUSD: 0,
                    factory: factory ? factory.toLowerCase() : null,
                  });
                  succeed = true;
                } catch (e) {
                  console.log(red("Failed to push pair"));
                  console.log(e);
                  console.log(JSON.stringify(pair));
                  failed += 1;
                }
              }

              resolve(null);
            })
          );
        }

        await Promise.all(pairsIterations);
      }

      console.log(
        "Formatted pairs for this blockchain : " + formattedPairs.length
      );
      crossChainFormattedPairs.push(formattedPairs);
    } else {
      crossChainFormattedPairs.push([]);
    }
  }

  return crossChainFormattedPairs;
}
