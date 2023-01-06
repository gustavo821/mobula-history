export type Blockchain =
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

export interface IPairV3 extends Pair {
  X96: string;
  fee: number;
  token0_address: string;
  token1_address: string;
  token0_decimals: number;
  token1_decimals: number;
}

export interface Token {
  address: string;
  type: "eth" | "stable" | "other";
  decimals: number;
}

export interface Pair {
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
  createdAtBlock: number;
  factory: string | null;
}
