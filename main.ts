import fs from "fs";
import { loadProxies } from "./MagicWeb3";
import { getMarketData } from "./market-univ2";
import { findAllPairs } from "./pairs-univ2";
import {
  getShardedPairsFromAddresses,
  getShardedPairsFromTokenId,
  MetaSupabase
} from "./supabase";
import { Pair } from "./types";
import { getCirculatingSupply, sendSlackMessage, types } from "./utils";
let currentAsset: any;

console.log = (...params) => {
  if (currentAsset) {
    fs.appendFileSync(
      "logs/" + currentAsset.name + ".logs",
      "\n[" + new Date().toISOString() + "] " + params.join(" ")
    );
  }
};

export const RPCLimits: {
  [index: string]: {
    queriesLimit: number;
    maxRange: {[index: string]: number};
    timeout: number;
    timeoutPlus: number;
  };
} = {
  "BNB Smart Chain (BEP20)": {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500
    },
    timeout: 30000,
    timeoutPlus: 3000,
  },
  Polygon: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500
    },    
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Ethereum: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 150
    },        timeout: 100000,
    timeoutPlus: 2000,
  },
  Fantom: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500
    },        timeout: 100000,
    timeoutPlus: 2000,
  },
  Cronos: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500
    },        timeout: 100000,
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
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500
    },        timeout: 100000,
    timeoutPlus: 2000,
  },
};

export async function main(settings: any) {
  const proxies = await loadProxies(10);
  const supabase = new MetaSupabase();

  const { data, error } = (await supabase
    .from("assets")
    .select(
      "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name"
    )
    .order("created_at", { ascending: false })
    .match({ name: settings.asset })) as any;

  console.info(!data, error);

  for (let i = 0; i < data.length; i++) {
    currentAsset = data[i];

    const { data: upToDateAsset } = await supabase
      .from("assets")
      .select("tried")
      .match({ id: currentAsset.id });

    if (!upToDateAsset?.[0].tried || settings.isPushingAnyway) {
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
        console.info("Loading data for asset " + data[i].name, settings);

        if (settings.isLoadingPairs) {
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
              const entry = pairs[j][k];
              const index = existingPairs
                .map((entry) => entry.address)
                .indexOf(entry.address);
              /** Signifies that the address is inlcuded in the existing addresses */
              if (index >= 0) {
                console.log("The pair does exist, modifying.");
                console.log(
                  JSON.stringify(
                    await supabase
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
                        created_at: new Date(entry.createdAt).toISOString(),
                        blockchain: data[i].blockchains[j],
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
            const bufferMarketCapHistory =
              data[i].total_supply_contracts?.length > 0
                ? {
                    market_cap_history: market_cap_history.filter(
                      (entry) => entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7
                    ),
                  }
                : {};

            const bufferMarketCapRecent =
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
                ...bufferMarketCapRecent,
              })
              .match({ id: data[i].id });

            console.log(JSON.stringify(assetData));
            console.log(JSON.stringify(assetError));
            console.log("Done with asset.");
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
