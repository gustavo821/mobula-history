import { green, magenta, red } from "colorette";
import fs from "fs";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick";
import { streamArray } from "stream-json/streamers/StreamArray";
import { swapEvent, syncEvent } from "./constants/crypto";
import { readLastBlock } from "./files";
import { loadOnChainData } from "./load";
import { RPCLimits } from "./main";
import { MetaSupabase } from "./supabase";
import { Blockchain, Pair, Token } from "./types";
import { getEthPrice, shouldLoad } from "./utils";

export async function getMarketData(
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
  const supabase = new MetaSupabase();

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
