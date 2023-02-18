import { blockchains } from "mobula-utils";
import { BlockchainName } from "mobula-utils/lib/chains/model";
import { createSupabaseClient, getShardedPairsFromTokenId } from "./supabase";

export async function pushPairs(id: number) {
  const pairs = await getShardedPairsFromTokenId(id);
  const supabase =  createSupabaseClient()

  if (pairs.length > 0) {
    const pairsData = {} as { [index: string]: number };

    const biggestPairs = pairs.sort((pairA: any, pairB: any) => {
      const pairAId = pairA.token0_id === id ? 0 : 1;
      const pairBId = pairB.token0_id === id ? 0 : 1;

      return (
        pairB.pair_data["reserve" + pairBId] /
          Math.pow(10, pairB["token" + pairBId + "_decimals"]) -
        pairA.pair_data["reserve" + pairAId] /
          Math.pow(10, pairA["token" + pairAId + "_decimals"])
      );
    });

    const getType = (type: string, blockchain: BlockchainName) => {
      if (type == "eth" && blockchains[blockchain]) {
        return blockchains[blockchain]!.eth.name;
      } else if (type == "stable") {
        return "USD";
      } else return "Others";
    };

    pairs.forEach((pair) => {
      const studiedToken = pair.token0_id === id ? "0" : "1";
      const oppositeToken = studiedToken === "0" ? "1" : "0";
      const type = getType(
        pair["token" + oppositeToken + "_type"],
        pair.blockchain
      );

      if (pairsData[type]) {
        pairsData[type] +=
          pair.pair_data["reserve" + studiedToken] /
          Math.pow(10, pair["token" + studiedToken + "_decimals"]);
      } else {
        pairsData[type] =
          pair.pair_data["reserve" + studiedToken] /
          Math.pow(10, pair["token" + studiedToken + "_decimals"]);
      }
    });

    const biggestAmount = Object.values(pairsData).reduce((prev, curr) => {
      return prev + curr;
    }, 0);

    Object.keys(pairsData).forEach((entry) => {
      pairsData[entry] = (pairsData[entry] / biggestAmount) * 100;
    });

    const { error } = await supabase
      .from("assets_raw_pairs")
      .upsert({
        id: id,
        biggest_pairs: biggestPairs.slice(0, 30),
        raw_pairs: biggestPairs.map((entry) => entry.address),
        pairs_id: biggestPairs.map((entry) => ({
          id: entry.id,
          table: entry.address.slice(0, 3).toLowerCase(),
        })),
        pairs_data: pairsData,
        pairs_with_id_0: biggestPairs.map((entry) => ({
          address: entry.address,
          id_0: entry.token0_id,
          decimals:
            entry.token0_id === id
              ? entry.token0_decimals
              : entry.token1_decimals,
        })),
        pairs_count: biggestPairs?.length,
      })
      .match({ id: id });

    if (error) {
      console.log("[UpdateBiggestPairs] error " + error + " with " + id);
    } else {
      console.log("[UpdateBiggestPairs] Pushed successfully with " + id);
    }
  }
}
