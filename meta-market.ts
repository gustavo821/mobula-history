export const getMarketMetaData = (
  price_history: [number, number][],
  volume_history: [number, number][],
  liquidity_history: [number, number][]
) => {
  let bestPrice = 0;
  let worstPrice = Infinity;
  let athTime = 0;
  let atlTime = 0;

  for (const entry of price_history) {
    if (entry[1] && bestPrice < entry[1]) {
      athTime = entry[0];
      bestPrice = entry[1];
    }
    if (entry[1] && worstPrice > entry[1]) {
      atlTime = entry[0];
      worstPrice = entry[1];
    }
  }

  let bestVolume = 0;
  let athVolumeTime = 0;

  for (const entry of volume_history) {
    if (entry[1] && bestVolume < entry[1]) {
      athVolumeTime = entry[0];
      bestVolume = entry[1];
    }
  }

  let bestLiquidity = 0;
  let athLiquidityTime = 0;

  for (const entry of liquidity_history) {
    if (entry[1] && bestLiquidity < entry[1]) {
      athLiquidityTime = entry[0];
      bestLiquidity = entry[1];
    }
  }

  return {
    ath: [athTime, bestPrice],
    atl: [atlTime, worstPrice],
    ath_volume: [athVolumeTime, bestVolume],
    ath_liquidity: [athLiquidityTime, bestLiquidity],
    listed_at: price_history?.[0]?.[0] || 0,
  };
};
