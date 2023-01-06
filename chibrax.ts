import fs from "fs";
import { loadOnChainData } from "./load";
import { loadProxies } from "./MagicWeb3";
console.info("Starting up.. ta big daronne");

console.log("OPening file");
const enferFile = fs.readFileSync(
  "/root/finalstory/3/mobula-history/logs/enfer.json",
  "utf8"
);

const transactionsHashes = enferFile
  .split('transactionHash":')
  .map((entry: any) => entry.split('"')[1]);

console.log("Trasactiojns: ", transactionsHashes.length);

const count: any = {};

for (const entry of transactionsHashes) {
  count[entry] = count[entry] ? count[entry] + 1 : 1;
}

console.log("done");
console.log(Object.entries(count).filter((entry: any) => entry[1] > 1));

(async () => {
  return;
  const proxies = await loadProxies(2);
  loadOnChainData({
    address: "0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf",
    topics: [
      [
        "0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde",
        "0x70935338e69775456a85ddef226c395fb668b63fa0115f5f20610b388e6ca9c0",
        "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
      ],
    ],
    id: 0,
    blockchain: "Ethereum",
    name: "enfer.json",
    proxies,
    genesis: 12500863,
    type: "market-univ2",
  });
})();
