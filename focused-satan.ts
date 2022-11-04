import { main } from "./main";

const settings = {
  isPushingAnyway: true,
  isLoadingPairs: false,
  isLoadingMarket: true,
  asset: "Polinate",
  fromDate: Date.now() - 60 * 1000 * 24,
  toDate: Date.now()
};

main(settings);
