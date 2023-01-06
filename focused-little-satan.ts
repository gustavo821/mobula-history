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
      "contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name,pairs_loaded"
    )
    .order("created_at", { ascending: false })
    .not("contracts", "eq", "{}")
    .match({ history_loaded: false })
    .limit(100)) as any;

  // console.info(data);

  main(settings, data);
})();
