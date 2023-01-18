import { Log } from "@ethersproject/providers";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { ethers } from "ethers";
import { ERC20ABI, V3POOL_ABI } from "./abis";
import {
  collectV3,
  mintV3Event,
  swapEvent,
  syncEvent,
} from "./constants/crypto";
import { IPairV3 } from "./types";

export const factory = "0x1f98431c8ad98523631ae4a59f267346ea31f984";
export const poolCreatedEvent =
  "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118";

export const V3SwapEvent =
  "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

export function formatV3EventToV2(pool: IPairV3, event: Log): Log[] {
  const logs: Log[] = [];
  try {
    if (event.topics[0] == mintV3Event || event.topics[0] == collectV3) {
      let coef = 1;
      if (event.topics[0] == collectV3) {
        coef = -1;
      }
      const inter = new ethers.utils.Interface(V3POOL_ABI);
      const decodedData = inter.decodeEventLog(event.topics[0], event.data);
      const bufferReserve0 =
        BigInt(pool.pairData.reserve0) +
        decodedData.amount0.toBigInt() * BigInt(coef);
      const bufferReserve1 =
        BigInt(pool.pairData.reserve1) +
        decodedData.amount1.toBigInt() * BigInt(coef);

      const tempEvent: Log = {
        address: event.address,
        blockHash: event.blockHash,
        transactionIndex: event.transactionIndex,
        removed: event.removed,
        topics: [syncEvent],
        logIndex: event.logIndex,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        data: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256"],
          [bufferReserve0, bufferReserve1]
        ),
      };
      logs.push(tempEvent);
    } else {
      //swap
      const routerInterface = new ethers.utils.Interface(V3POOL_ABI);
      const decodedData = routerInterface.decodeEventLog(
        "Swap",
        event.data
      ) as unknown as { amount0: ethers.BigNumber; amount1: ethers.BigNumber };

      let amount0In = "0";
      let amount0Out = "0";
      let amount1In = "0";
      let amount1Out = "0";

      const bufferAmount0 = decodedData.amount0.toBigInt();
      const bufferAmount1 = decodedData.amount1.toBigInt();
      console.log(event.transactionHash);
      if (bufferAmount0 < 0n) {
        amount0In = String(bufferAmount0).replace("-", "");
        amount1Out = String(bufferAmount1);
      } else {
        amount1In = String(bufferAmount1).replace("-", "");
        amount0Out = String(bufferAmount0);
      }

      const tempEvent: Log = {
        address: event.address,
        blockHash: event.blockHash,
        transactionIndex: event.transactionIndex,
        removed: event.removed,
        topics: [swapEvent, event.topics[1], event.topics[2]],
        logIndex: event.logIndex,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        data: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256", "uint256", "uint256"],
          [amount0In, amount1In, amount0Out, amount1Out]
        ),
      };
      logs.push(tempEvent);

      const bufferReserve0 =
        BigInt(pool.pairData.reserve0) + decodedData.amount0.toBigInt();
      const bufferReserve1 =
        BigInt(pool.pairData.reserve1) + decodedData.amount1.toBigInt();

      const tempEventSync: Log = {
        address: event.address,
        blockHash: event.blockHash,
        transactionIndex: event.transactionIndex,
        removed: event.removed,
        topics: [syncEvent],
        logIndex: event.logIndex,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        data: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256"],
          [bufferReserve0, bufferReserve1]
        ),
      };
      logs.push(tempEventSync);
    }

    return logs;
  } catch (e) {
    let frefrefe;
    return [];
  }
}

export function formatV3Swap(
  log: Log,
  decimal0: number,
  decimal1: number
): { isValid: boolean; amount0: number; amount1: number } {
  const inter = new ethers.utils.Interface(V3POOL_ABI);

  if (log.topics[0] == V3SwapEvent) {
    const decoded = inter.decodeEventLog(V3SwapEvent, log.data, log.topics);
    console.log(decoded);
    const negative0 = decoded.amount0._hex.includes("-");
    const negative1 = decoded.amount1._hex.includes("-");
    const str0 = negative0
      ? decoded.amount0._hex.replace("-", "")
      : decoded.amount0._hex;
    const str1 = negative1
      ? decoded.amount1._hex.replace("-", "")
      : decoded.amount1._hex;
    const amount0 =
      toNumberHighPrecision(BigInt(str0), decimal0) * (negative0 ? -1 : 1);
    const amount1 =
      toNumberHighPrecision(BigInt(str1), decimal1) * (negative1 ? -1 : 1);
    console.log(`Amount0: ${amount0}`);
    console.log(`Amount1: ${amount1}`);

    return { isValid: true, amount0: amount0, amount1: amount1 };
  } else {
    console.log(`formatV3Swap(): Not a v3 swap!! ${log.topics[0]}`);
    return { isValid: false, amount0: 0, amount1: 0 };
  }
}

export const toNumberHighPrecision = (amount: bigint, decimals: number) => {
  return Number((amount * 1000000n) / BigInt(10 ** decimals)) / 1000000;
};

export async function safeSupabase(
  query: PostgrestFilterBuilder<any>
): Promise<boolean> {
  let finalReturn = false;
  while (!finalReturn) {
    try {
      finalReturn = await new Promise(async (resolve) => {
        const TO = setTimeout(() => {
          console.log(`safeSupabase(): timed-out, re-trying...`);
          resolve(false);
        }, 10000);

        const result = await query;

        if (result?.data) {
          clearTimeout(TO);
          resolve(true);
        } else {
          console.log(
            `safeSupabase(): error, re-trying... ${result.error.message}`
          );
          resolve(false);
        }
      });
    } catch (e) {
      console.log(`safeSupabase(): went in catch, re-trying...`);
    }
  }

  return finalReturn;
}

export async function getTokenDecimalForSure(
  contract: string,
  provider: ethers.providers.BaseProvider
): Promise<number> {
  let decimal = -1;
  let fetched = false;
  const ctr = new ethers.Contract(contract, ERC20ABI, provider);
  let errCount = 0;
  while (!fetched) {
    try {
      const bufferDecimal = await ctr.decimals();
      decimal = Number(BigInt(bufferDecimal._hex));
      return decimal;
    } catch (e) {
      errCount++;
      if (errCount > 10) {
        console.log(
          `getTokenDecimalForSure(): errCount > 10, for ${contract}. Returning -1`
        );
        return -1;
      }
      if (
        (e?.error?.code != "TIMEOUT" && e?.message?.includes("reverted")) ||
        e?.message?.includes("Reverted")
      ) {
        console.error(`getTokenDecimalForSure: REVERTED for ${contract}`);
        console.log(e.message);
        return decimal;
      }
      await delay(1500);
    }
  }
  return decimal;
}

async function promiseWrapper(query: Promise<any>): Promise<any> {
  let fetched = false;
  while (!fetched) {
    fetched = await new Promise(async (resolve) => {
      const TO = setTimeout(() => {
        resolve(false);
      }, 10000);
      try {
        await query;
        clearTimeout(TO);
        resolve(true);
      } catch (e) {
        console.error(`promiseWrapper() error: ${e.message}`);
        clearTimeout(TO);
        resolve(false);
      }
    });
  }

  return;
}

async function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const toNumber = (amount: bigint, decimals: number) => {
  return Number((amount * 10000n) / BigInt(10 ** decimals)) / 10000;
};

export const stableTokens: string[] = [
  "0xe9e7cea3dedca5984780bafc599bd69add087d56", //BUSD BSC
  "0x55d398326f99059ff775485246999027b3197955", //USDT BSC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT ETH
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC ETH
  "0x6b175474e89094c44da98b954eedeac495271d0f", //DAI ETH
  "0x8e870d67f660d95d5be530380d0ec0bd388289e1", // USDP ETH
  "0xc7198437980c041c805a1edcba50c1ce5db95118", //USDTe Avalanche
  "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", //USDC Avalanche
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", //USDC Polygon
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", //USDT Polygon
  "0x04068da6c83afcfa0e13ba15a6696662335d5b75", //USDC Fantom
  "0x049d68029688eabf473097a2fc38ef61633a3c7a", //Frapped USD Fantom
  "0xc21223249ca28397b4b6541dffaecc539bff0c59", //USDC Cronos
  "0x66e428c3f67a68878562e79a0234c1f83c208770", //USDT Cronos
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", //USDT Arbitrum
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", //USDC Arbitrum
  "0x4988a896b1227218e4a686fde5eabdcabd91571f", //USDT.e Aurora
  "0xb12bfca5a55806aaf64e99521918a4bf0fc40802", //USDC Aurora
  "0xea32a96608495e54156ae48931a7c20f0dcc1a21", //m.USDC Metis
  "0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc", //m.USDT Metic
  "0x7f5c764cbc14f9669b88837ca1490cca17c31607", //USDC Optimism
  "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", //USDT Optimism
  "0x224e64ec1bdce3870a6a6c777edd450454068fec", //UST Harmony
  "0x985458e523db3d53125813ed68c274899e9dfab4", //1USDC Harmony
];

export const WETHTokens: string[] = [
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //WBNB BSC
  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", //WMATIC Polygon
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH ETH
  "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", //WFTM Fantom
  "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23", //WCRO Cronos
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", //WETH Arbitrum
  "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", //WAVAX Avalance
  "0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb", //WETH Aurora
  "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000", //METIS Metis
  "0x4200000000000000000000000000000000000006", //WETH Optimism
  "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a", //WONE Harmony
];

export function getTokenType(address: string): "stable" | "eth" | "other" {
  let type: "stable" | "eth" | "other" = "other";

  if (
    stableTokens.includes(address) ||
    stableTokens.includes(address.toLowerCase())
  ) {
    type = "stable";
  }

  if (
    WETHTokens.includes(address) ||
    WETHTokens.includes(address.toLowerCase())
  ) {
    type = "eth";
  }

  return type;
}
