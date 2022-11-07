import { main } from "./main";
import { MetaSupabase } from "./supabase";

const settings = {
  isPushingAnyway: true,
  isLoadingPairs: true,
  isLoadingMarket: true,
  isPushingToDB: true,
  fromDate: Date.now() - 60 * 1000 * 24,
  toDate: Date.now(),
};

(async () => {
  const supabase = new MetaSupabase();
  const { data, error } = (await supabase
    .from("assets")
    .select(
      "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name"
    )
    .order("created_at", { ascending: false })
    .not("contracts", "eq", "{}")
    .lt("market_cap", 100000000)
    .match({ history_loaded: false })) as any;

  // console.info(data)

  main(settings, data);
})();
