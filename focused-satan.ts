import Web3 from "web3";
import { Log } from "web3-core";
import { MagicWeb3, loadProxies } from "./MagicWeb3";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick";
import { ignore } from "stream-json/filters/Ignore";
import { streamArray } from "stream-json/streamers/StreamArray";

import config from "./config";
import fs from "fs";
import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { green, yellow, red, magenta } from "colorette";
import {
  createPairsSupabaseClient,
  DEAD_WALLETS,
  ERC20ABI,
  getShardedPairsFromAddresses,
  getShardedPairsFromTokenId,
  providers,
} from "./constants/crypto";
import { AbiItem } from "web3-utils";
import axios from "axios";

const supabase = createClient(
  "https://ylcxvfbmqzwinymcjlnx.supabase.co",
  config.SUPABASE_KEY as string
);

const supabasePairsClient = createPairsSupabaseClient();

interface Token {
  address: string;
  type: "eth" | "stable" | "other";
  decimals: number;
}

interface Pair {
  address: string;
  token0: Token;
  token1: Token;
  pairData: {
    volumeToken0: number;
    volumeToken1: number;
    volumeUSD: number;
    reserve0: bigint;
    reserve1: bigint;
    reserveUSD: number;
  };
  numberReserve?: number;
  priceUSD: number;
  createdAt: number;
}

type Blockchain =
  // | "Arbitrum"
  // |
  // | "Aurora"
  // |
  | "Avalanche C-Chain"
  | "BNB Smart Chain (BEP20)"
  | "Cronos"
  | "Ethereum"
  | "Fantom"
  | "Harmony"
  | "Optimism"
  | "Polygon";

const supportedRPCs: { [index: string]: string[] } = {
  "Avalanche C-Chain": ["https://api.avax.network/ext/bc/C/rpc"],
  "BNB Smart Chain (BEP20)": [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed2.binance.org/",
    // "https://bsc-dataseed3.binance.org/",
    // "https://bsc-dataseed4.binance.org/",
    // "https://bsc-dataseed1.defibit.io/",
    // "https://bsc-dataseed2.defibit.io/",
    // "https://bsc-dataseed3.defibit.io/",
    // "https://bsc-dataseed4.defibit.io/",
    // "https://bsc-dataseed1.ninicoin.io/",
    // "https://bsc-dataseed2.ninicoin.io/",
    // "https://bsc-dataseed3.ninicoin.io/",
    // "https://bsc-dataseed4.ninicoin.io/",
  ],
  Ethereum: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
  Fantom: ["https://rpc.ftm.tools/"],
  Polygon: ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon"],
  Cronos: ["https://evm-cronos.crypto.org"],
  "Metis Andromeda": ["https://andromeda.metis.io/owner1088"],
  // Aurora: ["https://mainnet.aurora.dev"],
  // Arbitrum: ["https://rpc.ankr.com/arbitrum"],
};

const RPCLimits: {
  [index: string]: {
    queriesLimit: number;
    maxRange: number;
    timeout: number;
    timeoutPlus: number;
  };
} = {
  "BNB Smart Chain (BEP20)": {
    queriesLimit: 0.1,
    maxRange: 100,
    timeout: 30000,
    timeoutPlus: 3000,
  },
  Polygon: {
    queriesLimit: 0.1,
    maxRange: 100,
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Ethereum: {
    queriesLimit: 0.1,
    maxRange: 100,
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Fantom: {
    queriesLimit: 0.1,
    maxRange: 100,
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Cronos: {
    queriesLimit: 0.1,
    maxRange: 100,
    timeout: 100000,
    timeoutPlus: 2000,
  },
  // 'Metis Andromeda': { queriesLimit: 50, maxRange: 20000 },
  // Arbitrum: {
  //   queriesLimit: 0.1,
  //   maxRange: 100,
  //   timeout: 100000,
  //   timeoutPlus: 2000,
  // },
  // 'Aurora': { queriesLimit: 4, maxRange: 5000, timeout: 3000, timeoutPlus: 2000 },
  "Avalanche C-Chain": {
    queriesLimit: 0.1,
    maxRange: 100,
    timeout: 100000,
    timeoutPlus: 2000,
  },
};

const WETHAndStables: { [index: string]: string[] } = {
  "BNB Smart Chain (BEP20)": [
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    "0x55d398326f99059ff775485246999027b3197955",
  ],
  Polygon: [
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  ],
  Ethereum: [
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  ],
  Fantom: [
    "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    "0x049d68029688eabf473097a2fc38ef61633a3c7a",
  ],
  Cronos: [
    "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
    "0xc21223249ca28397b4b6541dffaecc539bff0c59",
    "0x66e428c3f67a68878562e79a0234c1f83c208770",
  ],
  // Arbitrum: [
  //   "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  //   "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  //   "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  // ],
  "Avalanche C-Chain": [
    "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0xc7198437980c041c805a1edcba50c1ce5db95118",
    "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
  ],
  // Aurora: [
  //   "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79",
  //   "0x4988a896b1227218e4a686fde5eabdcabd91571f",
  //   "0xb12bfca5a55806aaf64e99521918a4bf0fc40802",
  // ],
};

const swapEvent =
  "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
const transferEvent =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const createPairEvent =
  "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9";
const syncEvent =
  "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1";

const restartSettings = {
  block: parseInt(config.BLOCK) || 0,
  restart: config.RESTART === "true",
};

let currentAsset: any;

const shouldLoad = async (name: string) => {
  if (!restartSettings.restart) return true;
  if (fs.existsSync("logs/" + name)) {
    try {
      const lastChar = await readLastChar(name);
      console.log("Red last char: " + lastChar);
      return lastChar !== "}";
    } catch (e) {
      console.log("Error: " + e + " - should load.");
      return true;
    }
  }
  console.log("File does not exist - should load.");
  return true;
};

const readLastChar = async (name: string) => {
  return new Promise((resolve) => {
    fs.stat("logs/" + name, function postStat(_, stats) {
      fs.open("logs/" + name, "r", function postOpen(_, fd) {
        fs.read(
          fd,
          Buffer.alloc(1),
          0,
          1,
          stats.size - 1,
          function postRead(_, __, buffer) {
            resolve(buffer.toString("utf8"));
          }
        );
      });
    });
  });
};

const readLastBlock = async (name: string) => {
  if (fs.existsSync("logs/" + name)) {
    try {
      const end = (await new Promise((resolve) => {
        fs.stat("logs/" + name, function postStat(_, stats) {
          fs.open("logs/" + name, "r", function postOpen(_, fd) {
            fs.read(
              fd,
              Buffer.alloc(1000),
              0,
              1000,
              stats.size - 1000,
              function postRead(_, __, buffer) {
                resolve(buffer.toString("utf8"));
              }
            );
          });
        });
      })) as string;

      const block = end.split('"blockNumber":')[1].split(",")[0];
      if (!isNaN(parseInt(block))) {
        return parseInt(block);
      } else {
        return 0;
      }
    } catch (e) {
      return 0;
    }
  } else {
    return 0;
  }
};

const sendSlackMessage = async (channel: string, text: string) => {
  try {
    await axios.post(config.SLACK_HOOK as string, {
      channel,
      text,
    });
  } catch (e) {
    console.warn(e);
  }
};

console.log = (...params) => {
  if (currentAsset) {
    fs.appendFileSync(
      "logs/" + currentAsset.name + ".logs",
      "\n[" + new Date().toISOString() + "] " + params.join(" ")
    );
  }
};

(async () => {
  const proxies = await loadProxies(10);
  console.log(restartSettings);
  const { data, error } = (await supabase
    .from("assets")
    .select(
      "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name"
    )
    .order("created_at", { ascending: false })
    // .lt("market_cap", 14_500_000)
    // .gt("market_cap", 0)
    // .match({ tried: false })) as any;
    // .match({ name: "Octaplex Network" })) as any;
    .match({ name: "Avalanche" })) as any;
  // console.info(data, error);

  console.info(!data, error);

  for (let i = 0; i < data.length; i++) {
    currentAsset = data[i];

    const { data: upToDateAsset } = await supabase
      .from("assets")
      .select("tried")
      .match({ id: currentAsset.id });

    if (!upToDateAsset?.[0].tried || true) {
      await supabase
        .from("assets")
        .update({ tried: true })
        .match({ id: data[i].id });

      console.log("Updated asset.");

      if (data[i].blockchains && data[i].blockchains.length > 0) {
        console.log("Calling sharded pairs.");
        let pairs = await getShardedPairsFromTokenId(data[i].id);
        console.log("Done calling sharded pairs.");

        await sendSlackMessage(
          "logs-dev-2",
          "Loading data for asset " + data[i].name
        );
        console.info("Loading data for asset " + data[i].name);

        if (
          (!data[i].total_pairs || data[i].total_pairs.length === 0) &&
          false
        ) {
          pairs = await findAllPairs(
            proxies,
            data[i].contracts || [],
            data[i].blockchains || [],
            data[i].id
          );

          let allPairs: Pair[] = [];

          pairs.forEach((pair: Pair[]) => {
            allPairs = allPairs.concat(pair);
          });

          console.log(allPairs);

          let existingPairs: {
            address: string;
            token0_id: string;
            token1_id: string;
          }[] = [];

          for (let j = 0; j < allPairs.length; j += 150) {
            const existingPairsBuffer = await getShardedPairsFromAddresses(
              allPairs.slice(j, j + 150).map((pair) => pair.address)
            );

            console.log(allPairs.slice(j, j + 150).map((pair) => pair.address));

            existingPairs = existingPairs.concat(existingPairsBuffer);
          }

          for (let j = 0; j < pairs.length; j++) {
            for (let k = 0; k < pairs[j].length; k++) {
              const entry = pairs[j][k];
              const index = existingPairs
                .map((entry) => entry.address)
                .indexOf(entry.address);

              console.log(
                "========================================================"
              );
              console.log(entry, index);
              console.log(existingPairs);
              console.log(
                "========================================================"
              );

              /** Signifies that the address is inlcuded in the existing addresses */
              if (index >= 0) {
                console.log("The pair does exist, modifying.");
                console.log(
                  JSON.stringify(
                    await supabasePairsClient
                      .from("0x" + entry.address.toLowerCase()[2])
                      .update({
                        token0_id:
                          entry.token0.address.toLowerCase() ==
                          data[i].contracts[j].toLowerCase()
                            ? data[i].id
                            : existingPairs[index].token0_id,
                        token1_id:
                          entry.token1.address.toLowerCase() ==
                          data[i].contracts[j].toLowerCase()
                            ? data[i].id
                            : existingPairs[index].token1_id,
                      })
                      .match({ address: entry.address })
                  )
                );
              } else {
                console.log("The pair does not exist, inserting.");

                console.log(
                  JSON.stringify(
                    await supabasePairsClient
                      .from("0x" + entry.address.toLowerCase()[2])
                      .insert({
                        address: entry.address,
                        token0_address: entry.token0.address,
                        token0_type: entry.token0.type,
                        token0_decimals: entry.token0.decimals,
                        token0_priceUSD: 0,
                        token0_id:
                          entry.token0.address.toLowerCase() ==
                          data[i].contracts[j].toLowerCase()
                            ? data[i].id
                            : null,
                        token1_address: entry.token1.address,
                        token1_type: entry.token1.type,
                        token1_decimals: entry.token1.decimals,
                        token1_priceUSD: 0,
                        token1_id:
                          entry.token1.address.toLowerCase() ==
                          data[i].contracts[j].toLowerCase()
                            ? data[i].id
                            : null,
                        pair_data: entry.pairData,
                        created_at: new Date(entry.createdAt).toISOString(),
                        blockchain: data[i].blockchains[j],
                      })
                  )
                );
              }
            }
          }
        } else {
          for (let j = 0; j < pairs.length; j++) {
            if (pairs[pairs[j].blockchain]) {
              pairs[pairs[j].blockchain].push({
                address: pairs[j].address,
                token0: {
                  address: pairs[j].token0_address,
                  type: pairs[j].token0_type,
                  decimals: pairs[j].token0_decimals,
                },
                token1: {
                  address: pairs[j].token1_address,
                  type: pairs[j].token1_type,
                  decimals: pairs[j].token1_decimals,
                },
                pairData: pairs[j].pair_data,
                createdAt: pairs[j].created_at,
                priceUSD:
                  pairs[j].token0_id == data[i].id
                    ? pairs[j].token0_priceUSD
                    : pairs[j].token1_priceUSD,
              });
            } else {
              pairs[pairs[j].blockchain] = [
                {
                  address: pairs[j].address,
                  token0: {
                    address: pairs[j].token0_address,
                    type: pairs[j].token0_type,
                    decimals: pairs[j].token0_decimals,
                  },
                  token1: {
                    address: pairs[j].token1_address,
                    type: pairs[j].token1_type,
                    decimals: pairs[j].token1_decimals,
                  },
                  pairData: pairs[j].pair_data,
                  createdAt: pairs[j].created_at,
                  priceUSD:
                    pairs[j].token0_id == data[i].id
                      ? pairs[j].token0_priceUSD
                      : pairs[j].token1_priceUSD,
                },
              ];
            }
          }

          const freshPairs: Pair[][] = [];
          Object.keys(pairs).forEach((key) => {
            freshPairs[data[i].blockchains.indexOf(key)] = pairs[key as any];
          });

          pairs = freshPairs;
        }

        if (pairs.length > 50) {
          Object.keys(RPCLimits).forEach((key) => {
            RPCLimits[key].maxRange = RPCLimits[key].maxRange / 10;
          });
        }

        console.log("Done with pair stuff.");

        let circulatingSupply = 0;

        if (data[i].total_supply_contracts?.length > 0) {
          const { circulatingSupply: bufferCirculatingSupply } =
            await getCirculatingSupply(
              data[i].total_supply_contracts,
              data[i].circulating_supply_addresses,
              data[i].contracts,
              data[i].blockchains
            );

          circulatingSupply = bufferCirculatingSupply;
        }

        const {
          liquidity_history,
          market_cap_history,
          price_history,
          volume_history,
          total_volume_history,
        } = await getMarketData(
          proxies,
          data[i].contracts,
          data[i].blockchains,
          pairs,
          circulatingSupply,
          data[i].id
        );

        const bufferMarketCapHistory =
          data[i].total_supply_contracts?.length > 0
            ? {
                market_cap_history: market_cap_history.filter(
                  (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
                ),
              }
            : {};

        await supabase.from("history").delete().match({ asset: data[i].id });
        const { data: historyData, error: historyError } = await supabase
          .from("history")
          .insert({
            liquidity_history: liquidity_history.filter(
              (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
            ),

            price_history: price_history.filter(
              (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
            ),
            volume_history: volume_history.filter(
              (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
            ),
            total_volume_history: total_volume_history.filter(
              (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
            ),
            asset: data[i].id,
            ...bufferMarketCapHistory,
          })
          .match({ asset: data[i].id });
        console.log(historyData);
        console.log(historyError);

        const bufferMarketCapRecent =
          data[i].total_supply_contracts?.length > 0
            ? {
                market_cap_history: {
                  market_cap: market_cap_history.filter(
                    (entry) => entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7
                  ),
                },
              }
            : {};

        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .update({
            liquidity_history: {
              liquidity: liquidity_history.filter(
                (entry) => entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7
              ),
            },
            price_history: {
              price: price_history.filter(
                (entry) => entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7
              ),
            },
            volume_history: {
              volume: volume_history.filter(
                (entry) => entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7
              ),
            },
            total_volume_history: {
              total_volume: total_volume_history.filter(
                (entry) => entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7
              ),
            },
            processed: true,
            price: price_history[price_history.length - 1]?.[1] || 0,
            total_volume: Math.round(
              total_volume_history[total_volume_history.length - 1]?.[1] || 0
            ),
            liquidity: Math.round(
              liquidity_history[liquidity_history.length - 1]?.[1] || 0
            ),
            market_cap: Math.round(
              market_cap_history[market_cap_history.length - 1]?.[1] || 0
            ),
            volume: Math.round(
              volume_history[volume_history.length - 1]?.[1] || 0
            ),
            tracked:
              liquidity_history[liquidity_history.length - 1]?.[1] !==
                undefined &&
              liquidity_history[liquidity_history.length - 1]?.[1] > 500,
            history_loaded: true,
            ...bufferMarketCapRecent,
          })
          .match({ id: data[i].id });

        console.log(JSON.stringify(assetData));
        console.log(JSON.stringify(assetError));
        console.log("Done with asset.");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
})();

async function findAllPairs(
  proxies: string[],
  contracts: string[],
  blockchains: Blockchain[],
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
        });
      }

      // await new Promise((resolve) => setTimeout(resolve, 60 * 1000 * 5));

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
              try {
                const token0Address =
                  "0x" +
                  pair.topics[1]
                    .split("0x000000000000000000000000")[1]
                    .toLowerCase();

                // const decimalsToken0 = await new ethers.Contract(
                //   token0Address,
                //   ["function decimals() public view returns(uint256)"],
                //   new ethers.providers.JsonRpcProvider(
                //     supportedRPCs[blockchains[i]][0]
                //   )
                // ).decimals();

                /**
                 * This may look a bit off, but it's because as we're creating
                 * one instance per call, we need to randomize the proxy process.
                 */

                const decimalsToken0 = await new MagicWeb3(
                  supportedRPCs[blockchains[i]][0],
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
                  supportedRPCs[blockchains[i]][0],
                  [proxies[Math.floor(Math.random() * proxies.length)]]
                )
                  .contract(ERC20ABI as AbiItem[], token1Address)
                  .methods.decimals()
                  .call();

                console.log(green("Pushing new pair"));

                formattedPairs.push({
                  address:
                    "0x" +
                    pair.data
                      .split("0x000000000000000000000000")[1]
                      .slice(0, 40),
                  token0: {
                    address: token0Address,
                    type: WETHAndStables[blockchains[i]].includes(token0Address)
                      ? WETHAndStables[blockchains[i]][0] == token0Address
                        ? "eth"
                        : "stable"
                      : "other",
                    decimals: Number(decimalsToken0),
                  },
                  token1: {
                    address: token1Address,
                    type: WETHAndStables[blockchains[i]].includes(token1Address)
                      ? WETHAndStables[blockchains[i]][0] == token1Address
                        ? "eth"
                        : "stable"
                      : "other",
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
                  createdAt: pair.blockNumber,
                  priceUSD: 0,
                });
              } catch (e) {
                console.log(red("Failed to push pair"));
                console.log(e);
                console.log(JSON.stringify(pair));
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

async function getMarketData(
  proxies: string[],
  contracts: string[],
  blockchains: Blockchain[],
  pairs: Pair[][],
  circulatingSupply: number,
  id: number
): Promise<{
  liquidity_history: [number, number][];
  market_cap_history: [number, number][];
  price_history: [number, number][];
  volume_history: [number, number][];
  total_volume_history: [number, number][];
}> {
  console.log(proxies.length, "proxies loaded.");
  console.log("Loading market data...");

  /**
   * @TODO :
   * - Optimiser les query sur chaque blockchain => 30 minutes
   * - Add-up multi-chain data => 30 minutes
   * - Tester à mort [] => tout le reste de la journée
   * - getEthPrice() pour BNB Chain et Polygon
   */

  const { data: blocks_history } = (await supabase
    .from("blocks_history")
    .select("*")) as {
    data: {
      blocks: {
        blocks: [number, number][];
      };
      name: Blockchain;
    }[];
  };

  const { data: recent_blocks_history } = (await supabase
    .from("blocks")
    .select("*")) as {
    data: {
      blocks: {
        blocks: [number, number][];
      };
      name: Blockchain;
    }[];
  };

  const blockMap = new Map(
    blocks_history.map((entry) => {
      const mergedBlocks = entry.blocks.blocks
        .concat(
          recent_blocks_history[
            recent_blocks_history.map((e) => e.name).indexOf(entry.name)
          ].blocks.blocks
        )
        .sort((a, b) => {
          return a[0] - b[0];
        });

      return [
        entry.name,
        {
          blocks: mergedBlocks.filter(
            (entry, index) =>
              mergedBlocks.map((e) => e[1]).indexOf(entry[1]) == index
          ),
        },
      ];
    })
  );

  const { data: eth_history } = (await supabase
    .from("eth_history")
    .select("*")) as {
    data: {
      price: [number, number][];
      recent_price: [number, number][];
      name: Blockchain;
    }[];
  };

  const priceMap = new Map(
    eth_history.map((entry) => {
      return [entry.name, entry.price.concat(entry.recent_price)];
    })
  );

  const liquidity_per_blockchain = new Map(
    blockchains.map((blockchain) => {
      return [blockchain, [] as [number, number][]];
    })
  );

  const price_per_blockchain = new Map(
    blockchains.map((blockchain) => {
      return [blockchain, [] as [number, number][]];
    })
  );

  const volume_per_blockchain = new Map(
    blockchains.map((blockchain) => {
      return [blockchain, [] as [number, number][]];
    })
  );

  const total_volume_per_blockchain = new Map(
    blockchains.map((blockchain) => {
      return [blockchain, [] as [number, number][]];
    })
  );

  const liquidity_history: [number, number][] = [];
  const market_cap_history: [number, number][] = [];
  const price_history: [number, number][] = [];
  const volume_history: [number, number][] = [];
  const total_volume_history: [number, number][] = [];

  for (let i = 0; i < contracts.length; i++) {
    if (RPCLimits[blockchains[i]] && pairs[i]) {
      // console.log(pairs, i);
      const tokenGenesis = 0; // HOTFIX: createdAt is broken. Math.min(...pairs[i].map((pair) => pair.createdAt));
      console.log(
        JSON.stringify({
          topics: [[swapEvent, syncEvent]],
          address: pairs[i].map((pair) => pair.address),
          blockchain: blockchains[i],
          genesis: tokenGenesis,
          proxies: proxies.length,
          name: contracts[i] + "-" + "market.json",
        })
      );

      if (await shouldLoad(contracts[i] + "-" + "market.json")) {
        console.log("Loading market data.");
        const lastBlock = await readLastBlock(
          contracts[i] + "-" + "market.json"
        );

        console.log(lastBlock, tokenGenesis);

        await loadOnChainData({
          topics: [[swapEvent, syncEvent]],
          address: pairs[i].map((pair) => pair.address),
          blockchain: blockchains[i],
          genesis: Math.max(tokenGenesis, lastBlock),
          proxies,
          name: contracts[i] + "-" + "market.json",
          id,
        });
      }
    }
  }

  for (let i = 0; i < contracts.length; i++) {
    if (RPCLimits[blockchains[i]] && pairs[i]) {
      const blocks = blockMap.get(blockchains[i])!.blocks;

      const pipeline = chain([
        fs.createReadStream("logs/" + contracts[i] + "-" + "market.json"),
        parser(),
        pick({ filter: "data" }),
        streamArray(),
      ]);

      let counter = 0;
      let latestPriceUSD = 0;
      let latestHistoryBlock = {
        number: 0,
        index: 0,
        timestamp: 0,
      };

      let lastEntry: any;

      const pairsMap = new Map(
        pairs[i].map((pair) => {
          return [pair.address, pair];
        })
      );

      const toNumber = (amount: bigint, decimals: number) => {
        // @ts-ignore
        return Number((amount * 10000n) / BigInt(10 ** decimals)) / 10000;
      };

      await new Promise((resolve) => {
        const liquidity_history = liquidity_per_blockchain.get(blockchains[i])!;
        const price_history = price_per_blockchain.get(blockchains[i])!;
        const volume_history = volume_per_blockchain.get(blockchains[i])!;
        const total_volume_history = total_volume_per_blockchain.get(
          blockchains[i]
        )!;

        pipeline.on("data", (data: any) => {
          const entry = data.value;
          if (entry && entry.address) {
            lastEntry = entry;
            // console.log("=========================================");
            // console.log(entry, entry.value);
            const pair = pairsMap.get(entry.address.toLowerCase())!;
            const clearData = entry.data.split("0x")[1];

            if (pair) {
              // console.log(
              //   yellow(
              //     "New entry detected at block " +
              //       entry.blockNumber +
              //       " on pair " +
              //       pair.address +
              //       " at TX " +
              //       entry.transactionHash
              //   )
              // );
              /**
               * @TODO we look at the @blockNumber and see if it is bigger
               * than the timestamp saved in @block_history - if it is, we
               * iterate the timestamps of block_history and save in the
               * @data_history for each timestamp, the current state of the reserves, by
               * saving the @total_volume without retouching, recalculating the
               * @liquidity_history according to the @ETH price that we get locally
               * thanks to the already aggregated data
               * then consequently the @price_history
               */

              /**
               * We expect @daysPassed length to be most of the time equal to 1 when we jump
               * on a new day, but if there has been no trades for +24 hours, we will jump
               * two days, and we need to get a log for each day.
               */
              let daysPassed: [number, number][] = [];

              if (entry.blockNumber > latestHistoryBlock.number) {
                console.log(magenta("Need to push a new entry in history."));
                for (let q = latestHistoryBlock.index; q < blocks.length; q++) {
                  console.log("Fetching new history block", blocks[q][1]);
                  if (blocks[q][1] > entry.blockNumber) {
                    latestHistoryBlock.index = q;
                    latestHistoryBlock.number = blocks[q][1];
                    latestHistoryBlock.timestamp = blocks[q][0];
                    break;
                  }

                  if (latestHistoryBlock.index != 0) {
                    daysPassed.push(blocks[q]);
                  }
                }

                console.log("Iterating " + daysPassed.length + " days passed.");

                // if (latestHistoryBlock.number > entry.blockNumber) {
                for (let q = 0; q < daysPassed.length; q++) {
                  /**
                   * @TODO v1.1 : update all the pairs reserve compared to ETH price.
                   */

                  let averagePrice = 0;
                  let totalLiquidity = 0;
                  let totalUntrackedLiquidity = 0;
                  let totalVolume = 0;

                  for (const newPair of pairs[i]) {
                    const freshPair = pairsMap.get(newPair.address)!;
                    if (
                      !isNaN(freshPair.pairData.reserveUSD) &&
                      freshPair.pairData.reserveUSD > 500
                    ) {
                      totalLiquidity += freshPair.pairData.reserveUSD;
                      totalVolume += freshPair.pairData.volumeUSD;
                      averagePrice +=
                        freshPair.priceUSD * freshPair.pairData.reserveUSD;
                      console.log("Considering pair ", freshPair.address);
                      console.log(
                        JSON.stringify(
                          freshPair,
                          (key, value) =>
                            typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                        )
                      );
                    } else if (
                      !isNaN(freshPair.numberReserve as number) &&
                      freshPair.numberReserve
                    ) {
                      totalUntrackedLiquidity += freshPair.numberReserve;
                      totalVolume += freshPair.pairData.volumeUSD;
                    }
                  }

                  console.log(
                    JSON.stringify({
                      liquidity: totalLiquidity,
                      price: averagePrice,
                      totalVolume,
                    })
                  );

                  if (averagePrice && totalLiquidity)
                    averagePrice /= totalLiquidity;

                  const finalLiquidity =
                    (totalUntrackedLiquidity || 0) * (averagePrice || 0) +
                    totalLiquidity;

                  console.log(
                    green(
                      "Pushing new entry " +
                        daysPassed[q][0] +
                        ":" +
                        daysPassed[q][1]
                    )
                  );
                  console.log(
                    JSON.stringify({
                      liquidity: finalLiquidity,
                      price: averagePrice,
                      totalVolume,
                    })
                  );

                  let last24hTotalVolume = 0;
                  let lastDistance = Infinity;
                  for (let o = total_volume_history.length - 1; o >= 0; o--) {
                    if (
                      Math.abs(
                        daysPassed[q][0] -
                          (total_volume_history[o][0] + 24 * 60 * 60 * 1000)
                      ) < lastDistance
                    ) {
                      lastDistance = Math.abs(
                        daysPassed[q][0] -
                          (total_volume_history[o][0] + 24 * 60 * 60 * 1000)
                      );
                      last24hTotalVolume = total_volume_history[o][1];
                    }

                    if (
                      Math.abs(
                        daysPassed[q][0] -
                          (total_volume_history[o][0] + 24 * 60 * 60 * 1000)
                      ) >
                      48 * 60 * 60 * 1000
                    )
                      break;
                  }
                  liquidity_history.push([daysPassed[q][0], finalLiquidity]);
                  price_history.push([daysPassed[q][0], averagePrice]);
                  volume_history.push([
                    daysPassed[q][0],
                    totalVolume - last24hTotalVolume,
                  ]);
                  total_volume_history.push([daysPassed[q][0], totalVolume]);

                  // liquidity_per_blockchain.set(
                  //   blockchains[i],
                  //   liquidity_history
                  // );
                  // price_per_blockchain.set(blockchains[i], price_history);
                  // volume_per_blockchain.set(blockchains[i], volume_history);
                  // total_volume_per_blockchain.set(
                  //   blockchains[i],
                  //   total_volume_history
                  // );

                  // if (price_history.length > 20) process.exit();
                }
                // }
              } else {
                // console.log(
                //   "Now vs History : ",
                //   entry.blockNumber,
                //   latestHistoryBlock.number
                // );
              }
              // console.log("Start liquidity ", pair.pairData.reserveUSD);

              if (entry.topics[0] == swapEvent) {
                // console.log(green("Swap event detected. Processing."));
                const amount0In = BigInt("0x" + clearData.slice(0, 64));
                const amount1In = BigInt("0x" + clearData.slice(64, 128));
                const amount0Out = BigInt("0x" + clearData.slice(128, 192));
                const amount1Out = BigInt("0x" + clearData.slice(192, 256));
                const tokenIn =
                  // @ts-ignore
                  amount0In === 0n
                    ? "token1"
                    : // @ts-ignore
                    amount0Out === 0n
                    ? "token0"
                    : "token1";
                const tokenOut = tokenIn == "token1" ? "token0" : "token1";
                // console.log(
                //   JSON.stringify(
                //     { amount0In, amount1In, amount0Out, amount1Out },
                //     (key, value) =>
                //       typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                //   )
                // );

                const studiedToken =
                  pair[tokenIn].type != "other"
                    ? { ...pair[tokenIn], in: true, token: tokenIn }
                    : pair[tokenOut].type != "other"
                    ? { ...pair[tokenOut], in: true, token: tokenOut }
                    : pair[tokenIn].address == contracts[i].toLowerCase()
                    ? { ...pair[tokenIn], in: true, token: tokenIn }
                    : { ...pair[tokenOut], in: false, token: tokenOut };

                let amount = studiedToken.in
                  ? studiedToken.token == "token0"
                    ? amount0In
                    : amount1In
                  : studiedToken.token == "token0"
                  ? amount0Out
                  : amount1Out;

                let amountUSD: number;

                switch (studiedToken.type) {
                  case "eth":
                    amountUSD =
                      toNumber(amount, studiedToken.decimals) *
                      getEthPrice(
                        entry.blockNumber,
                        priceMap.get(blockchains[i])!
                      );
                    break;
                  case "stable":
                    amountUSD = toNumber(amount, studiedToken.decimals);
                    break;
                  case "other":
                    amountUSD =
                      toNumber(amount, studiedToken.decimals) *
                        price_history[price_history.length - 1]?.[1] || 0;
                    break;
                }

                const bufferPair = pair.pairData.volumeUSD;
                pair.pairData.volumeUSD += amountUSD;

                pairsMap.set(pair.address, pair);
              } else {
                // console.log(green("Sync event detected. Processing."));
                const reserve0 = BigInt("0x" + clearData.slice(0, 64));
                const reserve1 = BigInt("0x" + clearData.slice(64, 128));
                pair.pairData.reserve0 = reserve0;
                pair.pairData.reserve1 = reserve1;
                // console.log(
                //   JSON.stringify(
                //     { reserve0, reserve1 },
                //     (key, value) =>
                //       typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                //   )
                // );

                const tokenNumber =
                  pair.token0.address == contracts[i].toLowerCase() ? "0" : "1";
                const otherNumber = tokenNumber == "0" ? "1" : "0";
                const token = ("token" + tokenNumber) as "token0" | "token1";
                const other = ("token" + otherNumber) as "token0" | "token1";
                const tokenReserve = ("reserve" + tokenNumber) as
                  | "reserve0"
                  | "reserve1";
                const otherReserve = ("reserve" + otherNumber) as
                  | "reserve0"
                  | "reserve1";

                const studiedToken: Token & {
                  reserve: "reserve0" | "reserve1";
                } =
                  pair[token].type == "other"
                    ? pair[other].type == "other"
                      ? { ...pair[token], reserve: tokenReserve }
                      : { ...pair[other], reserve: otherReserve }
                    : pair[token].type == "stable"
                    ? { ...pair[token], reserve: tokenReserve }
                    : pair[other].type == "stable"
                    ? { ...pair[other], reserve: otherReserve }
                    : /**
                       * @PAINPOINT This one is a bit tricky, but basically if the tokenA is
                       * ETH, then consider it as other if it's not VS stable.
                       * Else we'll recursively query getEthPrice
                       * while we don't have ethPrice at all.
                       */
                      { ...pair[token], reserve: tokenReserve, type: "other" };

                let reserveUSD: number = 0;
                switch (studiedToken.type) {
                  case "eth":
                    reserveUSD =
                      toNumber(
                        pair.pairData[studiedToken.reserve],
                        studiedToken.decimals
                      ) *
                      getEthPrice(
                        entry.blockNumber,
                        priceMap.get(blockchains[i])!
                      ) *
                      2;
                    // console.log("ETH is the studied token");
                    // console.log(JSON.stringify({ reserveUSD }));
                    // console.log(
                    //   JSON.stringify({
                    //     tokenReserve: toNumber(
                    //       pair.pairData[studiedToken.reserve],
                    //       studiedToken.decimals
                    //     ),
                    //   })
                    // );
                    // console.log(
                    //   JSON.stringify({
                    //     ethPrice: getEthPrice(
                    //       entry.blockNumber,
                    //       priceMap.get(blockchains[i])!
                    //     ),
                    //   })
                    // );
                    // console.log(JSON.stringify({ latestPriceUSD }));

                    break;
                  case "stable":
                    reserveUSD =
                      toNumber(
                        pair.pairData[studiedToken.reserve],
                        studiedToken.decimals
                      ) * 2;
                    // console.log("Stable is the studied token");
                    // console.log(
                    //   JSON.stringify({
                    //     reserveUSD,
                    //   })
                    // );
                    // console.log(
                    //   JSON.stringify({
                    //     tokenReserve: toNumber(
                    //       pair.pairData[studiedToken.reserve],
                    //       studiedToken.decimals
                    //     ),
                    //   })
                    // );
                    // console.log(JSON.stringify({ latestPriceUSD }));
                    break;
                  case "other":
                    // reserveUSD =
                    //   toNumber(
                    //     pair.pairData[studiedToken.reserve],
                    //     studiedToken.decimals
                    //   ) *
                    //   latestPriceUSD *
                    //   2;
                    // console.log("Other is the studied token");
                    // console.log(
                    //   JSON.stringify({
                    //     reserveUSD,
                    //   })
                    // );
                    // console.log(
                    //   JSON.stringify({
                    //     tokenReserve: toNumber(
                    //       pair.pairData[studiedToken.reserve],
                    //       studiedToken.decimals
                    //     ),
                    //   })
                    // );
                    // console.log(JSON.stringify({ latestPriceUSD }));
                    break;
                }

                const reserveToken = toNumber(
                  pair.pairData[tokenReserve],
                  pair[token].decimals
                );

                const priceUSD =
                  reserveToken && reserveUSD
                    ? reserveUSD / 2 / reserveToken
                    : 0;
                // console.log(
                //   JSON.stringify(
                //     {
                //       reserve0,
                //       reserve1,
                //       reserveUSD,
                //       priceUSD,
                //       tokenReserve,
                //       numberReserve: toNumber(
                //         pair.pairData[tokenReserve],
                //         pair[token].decimals
                //       ),
                //     },
                //     (key, value) =>
                //       typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                //   )
                // );

                pair.pairData.reserveUSD = reserveUSD;
                pair.priceUSD = priceUSD;
                pair.numberReserve = toNumber(
                  pair.pairData[tokenReserve],
                  pair[token].decimals
                );
                pairsMap.set(pair.address, pair);

                // console.log(
                //   JSON.stringify({
                //     reserve: pair.pairData.reserveUSD,
                //     priceUSD,
                //   })
                // );

                let totalLiquidity = 0;
                let averagePrice = 0;

                for (const newPair of pairs[i]) {
                  const freshPair = pairsMap.get(newPair.address)!;
                  totalLiquidity += freshPair.pairData.reserveUSD;
                  averagePrice +=
                    freshPair.priceUSD * freshPair.pairData.reserveUSD;
                }

                // if (averagePrice && totalLiquidity)
                //   averagePrice /= totalLiquidity;
                // latestPriceUSD = averagePrice;
              }

              // console.log("New latestPriceUSD", latestPriceUSD);

              // console.log("Final liquidity ", pair.pairData.reserveUSD);
            } else {
              console.log(
                red("New entry with no pair associated " + entry.address)
              );
            }
          }
        });

        pipeline.on("error", (error) => {
          console.info(error, "logs/" + contracts[i] + "-" + "market.json");
          console.info("yo, skuuurt");
          console.log(error, "logs/" + contracts[i] + "-" + "market.json");
          console.log("yo, skuuurt");
          process.exit(100);
        });

        pipeline.on("end", () => {
          let daysPassed: [number, number][] = [];

          console.log(
            magenta("Need to push a new lastEntry in history. (end)")
          );
          for (let q = latestHistoryBlock.index; q < blocks.length; q++) {
            console.log("Fetching new history block", blocks[q][1]);

            if (latestHistoryBlock.index != 0) {
              daysPassed.push(blocks[q]);
            }
          }

          console.log("Iterating " + daysPassed.length + " days passed.");

          for (let q = 0; q < daysPassed.length; q++) {
            // const liquidity_history = liquidity_per_blockchain.get(
            //   blockchains[i]
            // )!;
            // const price_history = price_per_blockchain.get(blockchains[i])!;
            // const volume_history = volume_per_blockchain.get(blockchains[i])!;
            // const total_volume_history = total_volume_per_blockchain.get(
            //   blockchains[i]
            // )!;

            /**
             * @TODO v1.1 : update all the pairs reserve compared to ETH price.
             */

            let averagePrice = 0;
            let totalLiquidity = 0;
            let totalUntrackedLiquidity = 0;
            let totalVolume = 0;

            for (const newPair of pairs[i]) {
              const freshPair = pairsMap.get(newPair.address)!;
              if (
                !isNaN(freshPair.pairData.reserveUSD) &&
                freshPair.pairData.reserveUSD > 500
              ) {
                totalLiquidity += freshPair.pairData.reserveUSD;
                totalVolume += freshPair.pairData.volumeUSD;
                averagePrice +=
                  freshPair.priceUSD * freshPair.pairData.reserveUSD;
                console.log("Considering pair ", freshPair.address);
                console.log(freshPair);
              } else if (
                !isNaN(freshPair.numberReserve as number) &&
                freshPair.numberReserve
              ) {
                totalUntrackedLiquidity += freshPair.numberReserve;
                totalVolume += freshPair.pairData.volumeUSD;
              }
            }

            console.log({
              liquidity: totalLiquidity,
              price: averagePrice,
              totalVolume,
            });

            if (averagePrice && totalLiquidity) averagePrice /= totalLiquidity;

            const finalLiquidity =
              (totalUntrackedLiquidity || 0) * (averagePrice || 0) +
              totalLiquidity;

            console.log(
              green(
                "Pushing new entry " + daysPassed[q][0] + ":" + daysPassed[q][1]
              )
            );
            console.log({
              liquidity: finalLiquidity,
              price: averagePrice,
              totalVolume,
            });

            let last24hTotalVolume = 0;
            let lastDistance = Infinity;
            for (let o = total_volume_history.length - 1; o >= 0; o--) {
              if (
                Math.abs(
                  daysPassed[q][0] -
                    (total_volume_history[o][0] + 24 * 60 * 60 * 1000)
                ) < lastDistance
              ) {
                lastDistance = Math.abs(
                  daysPassed[q][0] -
                    (total_volume_history[o][0] + 24 * 60 * 60 * 1000)
                );
                last24hTotalVolume = total_volume_history[o][1];
              }

              if (
                Math.abs(
                  daysPassed[q][0] -
                    (total_volume_history[o][0] + 24 * 60 * 60 * 1000)
                ) >
                48 * 60 * 60 * 1000
              )
                break;
            }
            liquidity_history.push([daysPassed[q][0], finalLiquidity]);
            price_history.push([daysPassed[q][0], averagePrice]);
            volume_history.push([
              daysPassed[q][0],
              totalVolume - last24hTotalVolume,
            ]);
            total_volume_history.push([daysPassed[q][0], totalVolume]);

            liquidity_per_blockchain.set(blockchains[i], liquidity_history);
            price_per_blockchain.set(blockchains[i], price_history);
            volume_per_blockchain.set(blockchains[i], volume_history);
            total_volume_per_blockchain.set(
              blockchains[i],
              total_volume_history
            );
          }

          for (
            let n = 0;
            n < liquidity_per_blockchain.get(blockchains[i])!.length;
            n += 100
          ) {
            console.log(
              liquidity_per_blockchain.get(blockchains[i])!.slice(n, n + 100)
            );
          }

          for (
            let n = 0;
            n < liquidity_per_blockchain.get(blockchains[i])!.length;
            n += 100
          ) {
            console.log(
              volume_per_blockchain.get(blockchains[i])!.slice(n, n + 100)
            );
          }

          for (
            let n = 0;
            n < liquidity_per_blockchain.get(blockchains[i])!.length;
            n += 100
          ) {
            console.log(
              price_per_blockchain.get(blockchains[i])!.slice(n, n + 100)
            );
          }

          console.log("Resolving");

          resolve(null);
        });
      });
    }
  }

  let earliest: Blockchain = blockchains[0];
  let earliestTimestamp = Infinity;

  for (let i = 0; i < blockchains.length; i++) {
    if (
      earliestTimestamp >
      (liquidity_per_blockchain.get(blockchains[i])!?.[0]?.[0] || Date.now())
    ) {
      earliestTimestamp =
        liquidity_per_blockchain.get(blockchains[i])!?.[0]?.[0] || Date.now();
      earliest = blockchains[i];
    }
  }

  for (let i = 0; i < liquidity_per_blockchain.get(earliest)!.length; i++) {
    let liquidity = liquidity_per_blockchain.get(earliest)![i][1];
    let averagePrice = price_per_blockchain.get(earliest)![i][1] * liquidity;
    let volume = volume_per_blockchain.get(earliest)![i][1];
    let total_volume = total_volume_per_blockchain.get(earliest)![i][1];
    console.log(
      "Starting with ",
      price_per_blockchain.get(earliest)![i][1],
      liquidity
    );
    for (const blockchain of blockchains) {
      if (
        blockchain != earliest &&
        liquidity_per_blockchain.get(blockchain)![i]
      ) {
        liquidity += liquidity_per_blockchain.get(blockchain)![i][1];
        averagePrice +=
          price_per_blockchain.get(blockchain)![i][1] *
          liquidity_per_blockchain.get(blockchain)![i][1];
        console.log(
          "Incrementing with ",
          price_per_blockchain.get(blockchain)![i][1],
          liquidity_per_blockchain.get(blockchain)![i][1]
        );
        volume += volume_per_blockchain.get(blockchain)![i][1];
      }
    }

    console.log("Pushing", averagePrice / liquidity);

    liquidity_history.push([
      liquidity_per_blockchain.get(earliest)![i][0],
      liquidity,
    ]);
    price_history.push([
      liquidity_per_blockchain.get(earliest)![i][0],
      averagePrice / liquidity,
    ]);
    market_cap_history.push([
      liquidity_per_blockchain.get(earliest)![i][0],
      (averagePrice / liquidity) * circulatingSupply,
    ]);
    volume_history.push([
      liquidity_per_blockchain.get(earliest)![i][0],
      volume,
    ]);
    total_volume_history.push([
      liquidity_per_blockchain.get(earliest)![i][0],
      total_volume,
    ]);
  }

  return {
    liquidity_history,
    market_cap_history,
    price_history,
    volume_history,
    total_volume_history,
  };
}

async function loadOnChainData({
  address,
  topics,
  genesis,
  proxies,
  blockchain,
  name,
  id,
}: {
  address?: string | string[] | undefined;
  topics?: (string | string[] | null)[] | undefined;
  genesis: number;
  proxies: string[];
  name: string;
  blockchain: Blockchain;
  id: number;
}) {
  console.log("Genesis : " + genesis);
  if (restartSettings.block && restartSettings.block > genesis) {
    genesis = restartSettings.block;
    console.log("Updated genesis = " + genesis);
  }

  const magicWeb3 =
    blockchain === "BNB Smart Chain (BEP20)"
      ? new MagicWeb3(
          "https://little-dawn-grass.bsc.quiknode.pro/92bfde323130bc080301fa8d7736efb153432158/",
          [],
          { proxies: false }
        )
      : new MagicWeb3(supportedRPCs[blockchain], proxies);
  const normalWeb3 = new Web3(
    new Web3.providers.HttpProvider(supportedRPCs[blockchain][0])
  );
  const latestBlock = await getForSure(normalWeb3.eth.getBlock("latest"));
  const iterationsNeeded =
    (latestBlock.number - genesis) /
    RPCLimits[blockchain].maxRange /
    RPCLimits[blockchain].queriesLimit /
    (proxies.length * Math.min(supportedRPCs[blockchain].length, 2));

  if (!restartSettings.restart || !fs.existsSync("logs/" + name)) {
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

    for (
      let j = k;
      j < k + (latestBlock.number - genesis) / iterationsNeeded;
      j += RPCLimits[blockchain].maxRange
    ) {
      calls.push(
        new Promise((resolve) => {
          let pushed = false;

          const id = setTimeout(() => {
            if (!pushed) {
              pushed = true;
              needToRecall.push({
                fromBlock: j,
                toBlock: j + RPCLimits[blockchain].maxRange,
                type: "pair",
              });
            }
            resolve();
          }, RPCLimits[blockchain].timeout);
          magicWeb3
            .eth()
            .getPastLogs({
              fromBlock: Math.floor(j),
              toBlock: Math.floor(j + RPCLimits[blockchain].maxRange),
              address,
              topics,
            })
            .catch((e) => {
              if (!pushed) {
                pushed = true;
                needToRecall.push({
                  fromBlock: j,
                  toBlock: j + RPCLimits[blockchain].maxRange,
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
          return entry;
        } else {
          if (entry) ok++;
          return (
            k +
            index * RPCLimits[blockchain].maxRange +
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

    let bufferRange = RPCLimits[blockchain].maxRange;
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
      const recalls: Promise<Log[] | void | string>[] = [];
      const blocRange = Math.floor(
        RPCLimits[blockchain].maxRange /
          2 /
          Math.ceil(
            (proxies.length *
              supportedRPCs[blockchain].length *
              RPCLimits[blockchain].queriesLimit) /
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

                const id = setTimeout(() => {
                  if (!pushed) {
                    pushed = true;
                    tempNeedToRecall.push({
                      type: needToRecall[p].type,
                      fromBlock: x,
                      toBlock: x + bufferRange,
                    });
                  }
                  resolve("Timeout");
                }, RPCLimits[blockchain].timeout + iterations * RPCLimits[blockchain].timeoutPlus);

                magicWeb3
                  .eth()
                  .getPastLogs({
                    fromBlock: Math.floor(x),
                    toBlock: Math.floor(x + bufferRange),
                    address,
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
                        resolve("Empty");
                      } else if (
                        e.toString().includes("Forbidden") ||
                        e.toString().includes("CONNECTION ERROR") ||
                        e.toString().includes("limit")
                      ) {
                        resolve("Forbidden");
                      } else if (e.toString().includes("CONNECTION TIMEOUT")) {
                        resolve("Timeout");
                      } else {
                        console.log(e.toString());
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

      let broken = 0;
      let success = 0;
      let timeout = 0;
      let empty = 0;
      let forbidden = 0;

      const RPCResult = (await Promise.all(recalls)).map((entry, index) => {
        // @ts-ignore
        if (typeof entry != "string" && (entry?.length || 0) > 0) {
          return entry;
        } else {
          switch (entry) {
            case "Timeout":
              timeout++;
              break;
            case "Empty":
              empty++;
              break;
            case "Forbidden":
              forbidden++;
              break;
            default:
              broken++;
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

        if (reply && typeof reply != "string") {
          formattedEvents.push(reply);
        }
      }

      needToRecall = tempNeedToRecall;
      console.log(
        "Succesfully loaded " +
          formattedEvents.length +
          " events. Success: " +
          success
      );
      console.log(
        "Need to recall : " +
          needToRecall.length +
          " left. Timeouts : " +
          timeout +
          ". Forbidden : " +
          forbidden +
          ". Empty : " +
          empty +
          ". Others : " +
          broken
      );

      if (success === 0) failedIterations++;
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
}

function getEthPrice(blockNumber: number, price_history: [number, number][]) {
  let maxDist = Infinity;
  let bestPrice = 0;

  for (let i = 0; i < price_history.length; i++) {
    if (Math.abs(price_history[i][0] - blockNumber) < maxDist) {
      maxDist = Math.abs(price_history[i][0] - blockNumber);
      bestPrice = price_history[i][1];
    }
  }

  return bestPrice;
}

function openDataFile(filename: string) {
  console.log("Writing new file.");
  console.log(fs.writeFileSync("logs/" + filename, '{"data":['));
}

function closeDataFile(filename: string) {
  console.log("Closing new file");
  console.log(fs.appendFileSync("logs/" + filename, "]}"));
}

async function pushData(logs: Log[], filename: string, last: boolean) {
  console.log("Pushing", filename, last);

  if (logs.length == 0) {
    fs.appendFileSync("logs/" + filename, "[]" + (last ? "" : ","));
    return;
  }

  for (let i = 0; i < logs.length; i++) {
    // console.log(
    //   "adding ",
    //   JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ",")
    // );

    await new Promise((resolve) =>
      fs.appendFile(
        "logs/" + filename,
        JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ","),
        () => resolve(null)
      )
    );
  }

  console.log("Pushing " + logs.length + " events.");
}
function printMemoryUsage() {
  const memoryData = process.memoryUsage();

  const formatMemoryUsage = (data: number) =>
    `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

  const memoryUsage = {
    rss: `${formatMemoryUsage(
      memoryData.rss
    )} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(
      memoryData.heapTotal
    )} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(
      memoryData.heapUsed
    )} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };

  console.log(memoryUsage);
}

async function getCirculatingSupply(
  total_supply_contracts: string[],
  circulating_supply_addresses: string[],
  contracts: string[],
  blockchains: string[]
) {
  let total_supply = BigInt(0);
  for (const contract of total_supply_contracts) {
    const blockchain = blockchains[contracts.indexOf(contract)];

    if (providers[blockchain]) {
      try {
        const tokenDecimals = await new ethers.Contract(
          contract,
          ["function decimals() external view returns (uint256)"],
          providers[blockchain]
        ).decimals();

        if (tokenDecimals.toNumber() > 0) {
          total_supply += (
            await new ethers.Contract(
              contract,
              ["function totalSupply() external view returns (uint256)"],
              providers[blockchain]
            ).totalSupply()
          )
            .div(ethers.utils.parseUnits("10", tokenDecimals.toNumber() - 1))
            .toBigInt();
        } else {
          total_supply += (
            await new ethers.Contract(
              contract,
              ["function totalSupply() external view returns (uint256)"],
              providers[blockchain]
            ).totalSupply()
          ).toBigInt();
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  let circulating_supply = total_supply;

  circulating_supply_addresses =
    circulating_supply_addresses.concat(DEAD_WALLETS);
  //For now, supposing that the circulating supply addresses are coming from the main blockchain of the project

  let tokenDecimals;

  if (providers[blockchains[0]]) {
    tokenDecimals = await new ethers.Contract(
      contracts[0],
      ["function decimals() external view returns (uint256)"],
      providers[blockchains[0]]
    ).decimals();
  }

  for (const address of circulating_supply_addresses) {
    if (providers[blockchains[0]]) {
      if (tokenDecimals.toNumber() > 0) {
        circulating_supply -= (
          await new ethers.Contract(
            contracts[0],
            [
              "function balanceOf(address account) external view returns (uint256)",
            ],
            providers[blockchains[0]]
          ).balanceOf(address)
        )
          .div(ethers.utils.parseUnits("10", tokenDecimals.toNumber() - 1))
          .toBigInt();
      } else {
        circulating_supply -= (
          await new ethers.Contract(
            contracts[0],
            [
              "function balanceOf(address account) external view returns (uint256)",
            ],
            providers[blockchains[0]]
          ).balanceOf(address)
        ).toBigInt();
      }
    }
  }

  return { circulatingSupply: Number(circulating_supply) };
}

async function getForSure(promise: Promise<any>) {
  let success = false;
  while (!success) {
    try {
      return await promise;
    } catch (e) {
      console.log(e);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
