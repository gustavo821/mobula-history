import { mainNFT } from "./main-nft";
import { createSupabaseClient } from "./supabase";

const settings = {
  isPushingAnyway: true,
  isLoadingPairs: "default",
  isLoadingMarket: true,
  isPushingToDB: false,
  isLoadingMarketV3: false,
  isLoadingTransfersNFT: true,
  isLoadingFromTransfersNFT: false,
  fromDate: Date.now() - 60 * 1000 * 24,
  toDate: Date.now(),
};

(async () => {
  const supabase =  createSupabaseClient()
  // const { data, error } = (await supabase
  //   .from("assets")
  //   .select(
  //     "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name,pairs_loaded"
  //   )
  //   .order("market_cap", { ascending: false })
  //   .not("contracts", "eq", "{}")
  //   .match({ history_loaded: false })
  //   .limit(100)) as any;

  // console.info(data);

  const { data, error } = (await supabase
    .from("assets")
    .select(
      "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name"
    )
    .order("created_at", { ascending: false })
    .match({ name: "USD Coin" })) as any;

  const dataNFT = {
    id: 666,
    name: "CNC",
    contract: "0x828ad2904341f6026b4607a278349f5c840c4a2e",
  };

  mainNFT(settings, [dataNFT]);
  //main(settings, data);
})();
