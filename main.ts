import fs from "fs";
import { loadProxies } from "./MagicWeb3";
import { getMarketData } from "./market-univ2";
import { getMarketDataV3 } from "./market-univ3";
import { getMarketMetaData } from "./meta-market";
import { findAllPairs } from "./pairs-univ2";
import { loadDecimals } from "./push-decimals";
import { pushPairs } from "./push-pairs";
import {
  getShardedPairsFromAddresses,
  getShardedPairsFromTokenId,
  MetaSupabase,
} from "./supabase";
import { IPairV3, Pair } from "./types";
import { getCirculatingSupply, sendSlackMessage, types } from "./utils";
let currentAsset: any;

console.log = (...params) => {
  fs.appendFileSync(
    "logs/" + (currentAsset?.name || "NONAME") + ".logs",
    "\n[" + new Date().toISOString() + "] " + params.join(" ")
  );
};

export const RPCLimits: {
  [index: string]: {
    queriesLimit: { default: number; hardcore: number };
    maxRange: {
      [index: string]: { default: number; hardcore: number };
    };
    timeout: number;
    timeoutPlus: number;
  };
} = {
  "BNB Smart Chain (BEP20)": {
    queriesLimit: {
      default: 1,
      hardcore: 0.25,
    },
    maxRange: {
      "pairs-univ2": { default: 5000, hardcore: 5000 },
      "market-univ2": { default: 1250, hardcore: 10 },
    },
    timeout: 30000,
    timeoutPlus: 3000,
  },
  Polygon: {
    queriesLimit: {
      default: 1,
      hardcore: 0.25,
    },
    maxRange: {
      "pairs-univ2": { default: 5000, hardcore: 5000 },
      "market-univ2": { default: 1250, hardcore: 25 },
    },
    timeout: 100000,
    timeoutPlus: 20000,
  },
  Ethereum: {
    queriesLimit: {
      default: 1,
      hardcore: 0.25,
    },
    maxRange: {
      "pairs-univ2": { default: 5000, hardcore: 5000 },
      "market-univ2": { default: 50, hardcore: 25 },
      "transfers-nft": { default: 50, hardcore: 50 },
    },
    timeout: 100000,
    timeoutPlus: 20000,
  },
  Fantom: {
    queriesLimit: {
      default: 1,
      hardcore: 0.25,
    },
    maxRange: {
      "pairs-univ2": { default: 5000, hardcore: 5000 },
      "market-univ2": { default: 1250, hardcore: 25 },
    },
    timeout: 100000,
    timeoutPlus: 20000,
  },
  Cronos: {
    queriesLimit: {
      default: 1,
      hardcore: 0.25,
    },
    maxRange: {
      "pairs-univ2": { default: 2000, hardcore: 2000 },
      "market-univ2": { default: 1250, hardcore: 25 },
    },
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
    queriesLimit: {
      default: 1,
      hardcore: 0.25,
    },
    maxRange: {
      "pairs-univ2": { default: 2000, hardcore: 2000 },
      "market-univ2": { default: 1250, hardcore: 25 },
    },
    timeout: 100000,
    timeoutPlus: 2000,
  },
};

export async function main(settings: any, data: any[]) {
  const proxies = await loadProxies(2, 0);
  const supabase = new MetaSupabase();

  for (let i = 0; i < data.length; i++) {
    currentAsset = data[i];

    const { data: upToDateAsset } = await supabase
      .from("assets")
      .select("tried")
      .match({ id: currentAsset.id });

    if (true || !upToDateAsset?.[0].tried || settings.isPushingAnyway) {
      // await supabase
      //   .from("assets")
      //   .update({ tried: true })
      //   .match({ id: data[i].id });

      console.log("Updated asset. Iterating...");

      if (data[i].blockchains && data[i].blockchains.length > 0) {
        console.log("Calling sharded pairs.");
        let pairs = settings.isLoadingMarketV3
          ? []
          : await getShardedPairsFromTokenId(data[i].id);
        console.log("Done calling sharded pairs.");

        await sendSlackMessage(
          "logs-dev-2",
          "Loading data for asset " + data[i].name
        );
        console.info("Loading data for asset " + data[i].name, settings);

        const poolsByChain: IPairV3[][] = [];
        if (settings.isLoadingMarketV3) {
          const { data: pools, error: errPools } = await supabase
            .from("Pools-v3")
            .select("*")
            .or(`token0_id.eq.${data[i].id},token1_id.eq.${data[i].id}`);

          for (const chain of data[i].blockchains || []) {
            poolsByChain.push([]);
          }

          for (const pool of pools || []) {
            if (pool.address != "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf") {
              continue;
            }
            pool.pairData = pool.pair_data;
            delete pool.pair_data;

            const bufferObj0 = {
              type: pool.token0_type,
              address: pool.token0_address,
              decimals: pool.token0_decimals,
            };
            const bufferObj1 = {
              type: pool.token1_type,
              address: pool.token1_address,
              decimals: pool.token1_decimals,
            };

            pool.token0 = bufferObj0;
            pool.token1 = bufferObj1;
            delete pool.token0_type;
            delete pool.token0_address;
            delete pool.token0_decimals;

            delete pool.token1_type;
            delete pool.token1_address;
            delete pool.token1_decimals;

            poolsByChain[data[i].blockchains.indexOf(pool.blockchain)].push(
              pool
            );
          }

          const {
            liquidity_history,
            market_cap_history,
            price_history,
            volume_history,
            total_volume_history,
          } = await getMarketDataV3(
            proxies,
            data[i].contracts,
            data[i].blockchains,
            poolsByChain,
            data[i].circulatingSupply,
            data[i].id,
            settings.fromDate,
            settings.toDate
          );

          let freferfre;
        }

        ////////////////////////////////////////////////////////////////
        //Code below is the original
        ////////////////////////////////////////////////////////////////

        if (
          settings.isLoadingPairs === true ||
          (!data[i].pairs_loaded && settings.isLoadingPairs === "default")
        ) {
          console.log("Loading pairs...");
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
              const entry: Pair = pairs[j][k];
              const index = existingPairs
                .map((entry) => entry.address)
                .indexOf(entry.address);
              /** Signifies that the address is inlcuded in the existing addresses */
              if (index >= 0) {
                console.log("The pair does exist, modifying.");
                const update: any = {
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
                };
                if (entry.factory) {
                  update.factory = entry.factory
                    ? entry.factory.toLowerCase()
                    : null;
                }
                console.log(
                  JSON.stringify(
                    await supabase
                      .from("0x" + entry.address.toLowerCase()[2])
                      .update(update)
                      .match({ address: entry.address })
                  )
                );
              } else {
                console.log("The pair does not exist, inserting.");

                console.log(
                  JSON.stringify(
                    await supabase
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
                        created_at_date: new Date(
                          entry.createdAt
                        ).toISOString(), //make sure to push * 1000 !!
                        created_at_block: entry.createdAtBlock,
                        blockchain: data[i].blockchains[j],
                        factory: entry.factory
                          ? entry.factory.toLowerCase()
                          : null,
                      })
                  )
                );
              }
            }
          }

          await supabase
            .from("assets")
            .update({
              pairs_loaded: true,
            })
            .match({ id: data[i].id });
        } else {
          console.log("Not iterating through pairs.");
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
                createdAt: pairs[j].created_at_date,
                createdAtBlock: pairs[j].created_at_block,
                priceUSD:
                  pairs[j].token0_id == data[i].id
                    ? pairs[j].token0_priceUSD
                    : pairs[j].token1_priceUSD,
                factory: pairs[j].factory,
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
                  createdAt: pairs[j].created_at_date,
                  createdAtBlock: pairs[j].created_at_block,
                  priceUSD:
                    pairs[j].token0_id == data[i].id
                      ? pairs[j].token0_priceUSD
                      : pairs[j].token1_priceUSD,
                  factory: pairs[j].factory,
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

        // if (pairs.length > 50) {
        //   Object.keys(RPCLimits).forEach((key) => {
        //     RPCLimits[key].maxRange = RPCLimits[key].maxRange / 10;
        //   });
        // }

        console.log("Done with pair stuff.");

        if (settings.isLoadingMarket) {
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
            data[i].id,
            settings.fromDate,
            settings.toDate
          );

          let bufferMarketCapHistory;
          let bufferMarketCapRecent;

          if (settings.extentingData) {
            // TODO
            const loadedData: any = {
              liquidity_history,
              market_cap_history,
              price_history,
              volume_history,
              total_volume_history,
            };

            const { data: existingMarketDataRecent } = (await supabase
              .from("assets")
              .select(
                "price_history,liquidity_history,volume_history,total_volume_history"
              )
              .match({ id: data[i].id })) as any;

            const { data: existingMarketDataHistory } = (await supabase
              .from("history")
              .select(
                "price_history,liquidity_history,volume_history,total_volume_history"
              )
              .match({ asset: data[i].id })) as any;

            const oldData: any = {};

            types.forEach((type) => {
              oldData[type + "_history"] = (
                existingMarketDataHistory?.[type + "_history"] || []
              )
                .concat(
                  existingMarketDataRecent?.[type + "_history"]?.[type] || []
                )
                .sort((a: any, b: any) => a[0] - b[0]);
            });

            const finalData: any = {
              liquidity_history: [],
              market_cap_history: [],
              price_history: [],
              volume_history: [],
              total_volume_history: [],
            };

            for (const type of types) {
              for (
                let typeIterator = Math.min(
                  loadedData[type + "_history"][0][0],
                  oldData[type + "_history"][0][0]
                );
                typeIterator <
                Math.max(
                  loadedData[loadedData[type + "_history"].length - 1][0],
                  oldData[oldData[type + "_history"].length - 1][0]
                );
                typeIterator++
              ) {
                if (type == "price" || type == "market_cap") {
                  // Does not compound. We take the old value while we can, and if new value is the only one, we take that.
                  // finalData[type + "_history"].push(
                  //   oldData[type + "_history"][typeIterator] ?
                  //   oldData[type + "_history"][typeIterator]
                  // );
                } else {
                  // Compounds
                }
              }
            }
          } else {
            bufferMarketCapHistory =
              data[i].total_supply_contracts?.length > 0
                ? {
                    market_cap_history: market_cap_history.filter(
                      (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
                    ),
                  }
                : {};

            bufferMarketCapRecent =
              data[i].total_supply_contracts?.length > 0
                ? {
                    market_cap_history: {
                      market_cap: market_cap_history.filter(
                        (entry) =>
                          entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7
                      ),
                    },
                  }
                : {};
          }

          if (settings.isPushingToDB) {
            const { ath, atl, ath_volume, ath_liquidity, listed_at } =
              getMarketMetaData(
                price_history,
                volume_history,
                liquidity_history
              );

            await supabase
              .from("history")
              .delete()
              .match({ asset: data[i].id });

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
                  total_volume_history[total_volume_history.length - 1]?.[1] ||
                    0
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
                ath,
                atl,
                ath_volume,
                ath_liquidity,
                listed_at: new Date(listed_at).toISOString(),
                ...bufferMarketCapRecent,
              })
              .match({ id: data[i].id });

            console.log(JSON.stringify(assetData));
            console.log(JSON.stringify(assetError));
            console.log("Done with asset.");

            try {
              await pushPairs(data[i].id);
            } catch (e) {
              console.log("Error while pushing pairs", e);
            }

            try {
              await loadDecimals(data[i]);
            } catch (e) {
              console.log("Error while pushing pairs", e);
            }
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
