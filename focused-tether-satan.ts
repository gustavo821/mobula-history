import { main } from "./main";
import { createSupabaseClient } from "./supabase";

const settings = {
  isPushingAnyway: true,
  isLoadingPairs: "default",
  isLoadingMarket: true,
  isPushingToDB: true,
  fromDate: Date.now() - 60 * 1000 * 24,
  toDate: Date.now(),
};

(async () => {
  const supabase =  createSupabaseClient()
  const { data, error } = (await supabase
    .from("assets")
    .select(
      "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name,pairs_loaded"
    )
    .order("market_cap", { ascending: false })
    .not("contracts", "eq", "{}")
    .match({ name: "CubeBase" })
    .limit(100)) as any;

  // console.info(data);

  main(settings, data);
})();
