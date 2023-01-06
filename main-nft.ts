import { Log, TransactionReceipt } from "@ethersproject/providers";
import { ethers } from "ethers";
import fs from "fs";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick";
import { streamArray } from "stream-json/streamers/StreamArray";
import { Transaction } from "web3-core";
import {
  ENSNameRegisteredEvent,
  openSeaOrderFulfilledEvent,
  transferEvent,
  X2Y2Event,
} from "./constants/crypto";
import { readLastBlock } from "./files";
import { fetchAllReceipts, fetchAllValues, loadOnChainData } from "./load";
import { loadProxies } from "./MagicWeb3";
import { MetaSupabase } from "./supabase";
import { shouldLoad } from "./utils";
import {
  formatENSEvent,
  formatERCTransferEvent,
  formatOpenSeaEvent,
  formatX2Y2Event,
  ITokenTransfer,
  ITransferNFT,
} from "./utilsNFT";
import { toNumber } from "./utilsV3";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

let currentAsset: any;

console.log = (...params) => {
  if (currentAsset) {
    fs.appendFileSync(
      "logs/" + currentAsset.name + ".logs",
      "\n[" + new Date().toISOString() + "] " + params.join(" ")
    );
  }
};

export const RPCLimits: {
  [index: string]: {
    queriesLimit: number;
    maxRange: { [index: string]: number };
    timeout: number;
    timeoutPlus: number;
  };
} = {
  "BNB Smart Chain (BEP20)": {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500,
    },
    timeout: 30000,
    timeoutPlus: 3000,
  },
  Polygon: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500,
    },
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Ethereum: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 150,
      "transfers-nft": 200,
    },
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Fantom: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 5000,
      "market-univ2": 500,
    },
    timeout: 100000,
    timeoutPlus: 2000,
  },
  Cronos: {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 2000,
      "market-univ2": 500,
    },
    timeout: 100000,
    timeoutPlus: 2000,
  },
  // 'Metis Andromeda': { queriesLimit: 50, maxRange: 20000 },
  // Arbitrum: {
  //   queriesLimit: 0.1,
  //   maxRange: 100,
  //   timeout: 100000,
  //   timeoutPlus: 2000,
  // },
  // 'Aurora': { queriesLimit: 4, maxRange: 5000, timeout: 3000, timeoutPlus: 2000 },
  "Avalanche C-Chain": {
    queriesLimit: 0.5,
    maxRange: {
      "pairs-univ2": 2000,
      "market-univ2": 500,
    },
    timeout: 100000,
    timeoutPlus: 2000,
  },
};

function formatNFTTransferEvent(event: Log, _blockchain: string): ITransferNFT {
  let bufferType: "transfer" | "mint" | "burn" = "transfer";
  try {
    const bufferFrom = String(
      ethers.utils.defaultAbiCoder.decode(["address"], event.topics[1])
    ).toLowerCase();

    const bufferTo = String(
      ethers.utils.defaultAbiCoder.decode(["address"], event.topics[2])
    ).toLowerCase();

    if (bufferFrom == NULL_ADDRESS) {
      bufferType = "mint";
    }

    if (bufferTo == NULL_ADDRESS) {
      bufferType = "burn";
    }

    const bufferTransfer: ITransferNFT = {
      collection: event.address.toLowerCase(),
      seller: bufferFrom,
      buyer: bufferTo,
      id: ethers.utils.defaultAbiCoder
        .decode(["uint256"], event.topics[3])
        .toString(),
      blockchain: _blockchain,
      hash: event.transactionHash,
      type: bufferType,
      value: null,
      marketplace: "Unknown",
      NFT: true,
      bought_with_token: null,
      token_amount: "0",
      trade_value: 0,
      timestamp: 0,
      blockNumber: 0,
    };

    return bufferTransfer;
  } catch (e: any) {
    console.error(`formatNFTTransferEvent: ${e.message}`);
    return null as unknown as ITransferNFT;
  }
}

export async function mainNFT(settings: any, data: any[]) {
  const proxies = await loadProxies(10);
  const supabase = new MetaSupabase();
  const getterChainToETHPrice: { [index: string]: number } = {};

  const ethPrices = await supabase.from("eth_history").select("name,price_now");

  if (ethPrices.error || ethPrices?.data?.length == 0) {
    throw `[StreamNFT] Received null for ethPrices.`;
  }

  for (const entry of ethPrices.data) {
    if (entry?.price_now) {
      getterChainToETHPrice[entry.name] = entry.price_now;
    }
  }

  for (let i = 0; i < data.length; i++) {
    currentAsset = data[i];

    // const { data: upToDateAsset } = await supabase
    //   .from("assets_nft")
    //   .select("contract,id")
    //   .match({ id: currentAsset.id });
    console.info(
      `Checking if should load 1st batch for ${currentAsset.name} ${currentAsset.contract}`
    );
    if (settings.isLoadingTransfersNFT) {
      if (
        await shouldLoad(currentAsset.contract + "-" + "nft-transfers.json")
      ) {
        console.log("Loading market data.");
        const lastBlock = await readLastBlock(
          currentAsset.contract + "-" + "nft-transfers.json"
        );
        console.info(
          `Starting to load 1st batch for ${currentAsset.name} ${currentAsset.contract}`
        );
        await loadOnChainData({
          address: [currentAsset.contract], //NFTExchanges.concat([currentAsset.contract]),
          topics: [
            [
              transferEvent,
              //openSeaOrderFulfilledEvent,
              //ENSNameRegisteredEvent,
              //X2Y2Event,
            ],
          ],
          blockchain: "Ethereum",
          genesis: Math.max(16215000, lastBlock),
          proxies,
          name: currentAsset.contract + "-" + "nft-transfers.json",
          id: currentAsset.id,
          type: "transfers-nft",
          /*dataMustContain: currentAsset.contract
            .toLowerCase()
            .replace("0x", ""),*/
        });
        console.info(
          `Finished loading 1st batch for ${currentAsset.name} ${currentAsset.contract}`
        );
        settings.isLoadingTransfersNFT = false;
      } else {
        console.info(
          `Not loading 1st batch for ${currentAsset.name} ${currentAsset.contract}`
        );
      }
    }

    const pipeline1 = chain([
      fs.createReadStream(
        "logs/" + currentAsset.contract + "-" + "nft-transfers.json"
      ),
      parser(),
      pick({ filter: "data" }),
      streamArray(),
    ]);

    const getterHashToAmountOfTransferedNfts: { [index: string]: number } = {};
    const getterHashToIdOfTransferedNfts: { [index: string]: string[] } = {}; //Not to increment divider if NFT ID is the same
    const getterHashToERCTransfer: { [index: string]: ITokenTransfer[] } = {};
    const getterContractToPrice: { [index: string]: number } = {};
    const getterContractToDecimals: { [index: string]: number } = {};
    const getterBlockNumberToTimestamp: { [index: number]: number } = {};
    const hashToIgnore: string[] = [];
    const contractsToRequestPrice: string[] = [];
    const finalNFTTransfers: ITransferNFT[] = [];
    const collectionNamesAlreadyAsked: string[] = [];
    const collectionsToProcess: string[] = [];
    const getterCollectionToName: { [index: string]: string } = {};
    const getterHashToNFTTransfer: {
      [index: string]: ITransferNFT[];
    } = {};

    const uniqueBlocks: number[] = [];

    const blockchain = "Ethereum";
    collectionsToProcess.push(currentAsset.contract.toLowerCase());

    await new Promise(async (resolve1) => {
      pipeline1.on("data", async (data: any) => {
        try {
          const receivedEvent = data.value as Log;

          if (!uniqueBlocks.includes(receivedEvent.blockNumber)) {
            uniqueBlocks.push(receivedEvent.blockNumber);
          }
          if (receivedEvent?.topics[0] == openSeaOrderFulfilledEvent) {
            hashToIgnore.push(receivedEvent.transactionHash);

            if (receivedEvent.data.length > 1000) {
              const bufferTransfer = formatOpenSeaEvent(
                getterChainToETHPrice,
                receivedEvent,
                blockchain
              );

              if (
                bufferTransfer &&
                collectionsToProcess.includes(bufferTransfer.collection)
              ) {
                bufferTransfer.blockNumber = receivedEvent.blockNumber;
                finalNFTTransfers.push(bufferTransfer);

                if (
                  bufferTransfer?.bought_with_token &&
                  !contractsToRequestPrice.includes(
                    bufferTransfer.bought_with_token
                  )
                ) {
                  contractsToRequestPrice.push(
                    bufferTransfer.bought_with_token
                  );
                }

                if (getterCollectionToName[bufferTransfer.collection]) {
                  bufferTransfer.collection_name =
                    getterCollectionToName[bufferTransfer.collection];
                } else if (
                  !collectionNamesAlreadyAsked.includes(
                    bufferTransfer.collection
                  )
                ) {
                  collectionNamesAlreadyAsked.push(bufferTransfer.collection);
                }
              }
            }
          } else if (receivedEvent?.topics[0] == X2Y2Event) {
            const bufferTransfer = formatX2Y2Event(
              getterChainToETHPrice,
              receivedEvent,
              blockchain
            );
            if (
              bufferTransfer &&
              collectionsToProcess.includes(bufferTransfer.collection)
            ) {
              bufferTransfer.blockNumber = receivedEvent.blockNumber;
              finalNFTTransfers.push(bufferTransfer);

              if (
                bufferTransfer?.bought_with_token &&
                !contractsToRequestPrice.includes(
                  bufferTransfer.bought_with_token
                )
              ) {
                contractsToRequestPrice.push(bufferTransfer.bought_with_token);
              }

              if (getterCollectionToName[bufferTransfer.collection]) {
                bufferTransfer.collection_name =
                  getterCollectionToName[bufferTransfer.collection];
              } else if (
                !collectionNamesAlreadyAsked.includes(bufferTransfer.collection)
              ) {
                collectionNamesAlreadyAsked.push(bufferTransfer.collection);
              }
            }
          } else if (receivedEvent?.topics[0] == ENSNameRegisteredEvent) {
            const bufferTransfer = formatENSEvent(
              getterChainToETHPrice,
              receivedEvent,
              blockchain
            );
            if (
              bufferTransfer &&
              collectionsToProcess.includes(bufferTransfer.collection)
            ) {
              bufferTransfer.blockNumber = receivedEvent.blockNumber;
              finalNFTTransfers.push(bufferTransfer);
            }

            hashToIgnore.push(bufferTransfer.hash);
          } else if (
            !hashToIgnore.includes(receivedEvent.transactionHash) &&
            receivedEvent?.topics?.length == 4
          ) {
            if (
              collectionsToProcess.includes(receivedEvent.address.toLowerCase())
            ) {
              //Only NFT transfers come here
              const bufferTransfer = formatNFTTransferEvent(
                receivedEvent,
                blockchain
              );
              bufferTransfer.blockNumber = receivedEvent.blockNumber;

              //Array of NFT transfers for a single hash
              if (!getterHashToNFTTransfer[bufferTransfer.hash]) {
                getterHashToNFTTransfer[bufferTransfer.hash] = [];
              }
              getterHashToNFTTransfer[bufferTransfer.hash].push(bufferTransfer);

              //Array of NFT IDs not to increment divider if NFT ID is the same
              if (!getterHashToIdOfTransferedNfts[bufferTransfer.hash]) {
                getterHashToIdOfTransferedNfts[bufferTransfer.hash] = [];
              }

              //Increment the divider if this NFT ID is not in the array
              if (!getterHashToAmountOfTransferedNfts[bufferTransfer.hash]) {
                getterHashToAmountOfTransferedNfts[bufferTransfer.hash] = 1;
                //Pushing this NFT ID not to increment counter next time
                getterHashToIdOfTransferedNfts[bufferTransfer.hash].push(
                  bufferTransfer.id
                );
              } else if (
                !getterHashToIdOfTransferedNfts[bufferTransfer.hash].includes(
                  bufferTransfer.id
                )
              ) {
                //New NFT transfer for this hash
                getterHashToAmountOfTransferedNfts[bufferTransfer.hash] += 1;
                getterHashToIdOfTransferedNfts[bufferTransfer.hash].push(
                  bufferTransfer.id
                );
              }
            }
          } else if (
            !hashToIgnore.includes(receivedEvent.transactionHash) &&
            receivedEvent?.topics?.length == 3
          ) {
            //ERC Transfer events
            const bufferTransfer = formatERCTransferEvent(
              receivedEvent,
              blockchain
            );
            //Create empty array if doesn't exist
            if (!getterHashToERCTransfer[bufferTransfer.hash]) {
              getterHashToERCTransfer[bufferTransfer.hash] = [];
            }

            getterHashToERCTransfer[bufferTransfer.hash].push(bufferTransfer);
          }
        } catch (e: any) {
          console.error(`getNFTTransferEvents: ${e.message}`);
        }
      });

      pipeline1.on("end", async () => {
        console.info(
          `Finished processing 1st batch for ${currentAsset.contract}`
        );
        resolve1(null);
      });

      pipeline1.on("error", (e) => {
        console.info(
          `SAUCE L'AHURI ${currentAsset.contract} ${e?.message || e}`
        );
        console.log(
          `SAUCE L'AHURI ${currentAsset.contract} ${e?.message || e}`
        );
        process.exit(100);
      });
    });

    console.info(
      `Checking if should load log-events for ${currentAsset.contract}`
    );
    if (await shouldLoad(currentAsset.contract + "-" + "log-events.json")) {
      console.info(`Loading log-events for ${currentAsset.contract}`);
      const hashesLength = Object.keys(getterHashToNFTTransfer).length;
      console.info(`Checking hashes for ${hashesLength} hashes`);
      let iter = 0;
      for (const hash of Object.keys(getterHashToNFTTransfer)) {
        if (hashToIgnore.includes(hash)) {
          delete getterHashToNFTTransfer[hash];
        }

        if (iter % 1000 == 0) {
          console.info(`Checked ${iter} hashes out of ${hashesLength}`);
        }
        iter++;
      }

      const unmatchedHashes = Object.keys(getterHashToNFTTransfer);
      console.info(
        `Checking if should load unmatched hashes for ${currentAsset.contract}`
      );

      console.info(`Fetching receipts for ${currentAsset.contract}`);

      await fetchAllReceipts({
        hashes: unmatchedHashes,
        collection: currentAsset.contract.toLowerCase(),
        blockchain: blockchain,
        proxies: proxies,
        range: 50,
      });
    } else {
      console.info(`Not loading log-events for ${currentAsset.contract}`);
    }

    const pipeline2 = chain([
      fs.createReadStream(
        "logs/" + currentAsset.contract + "-" + "log-events.json"
      ),
      parser(),
      pick({ filter: "data" }),
      streamArray(),
    ]);

    await new Promise(async (resolve2) => {
      pipeline2.on("data", async (data: any) => {
        try {
          const receivedEvent = data.value as TransactionReceipt;

          for (const ercTransfer of receivedEvent.logs || []) {
            const senderERC = ethers.utils.defaultAbiCoder
              .decode(["address"], ercTransfer.topics[1])[0]
              .toLowerCase();
            const receiverERC = ethers.utils.defaultAbiCoder
              .decode(["address"], ercTransfer.topics[2])[0]
              .toLowerCase();

            if (getterHashToNFTTransfer[receivedEvent.transactionHash]) {
              const divider =
                getterHashToAmountOfTransferedNfts[
                  receivedEvent.transactionHash
                ];

              const nftTransfers =
                getterHashToNFTTransfer[receivedEvent.transactionHash];
              for (const nftTransfer of getterHashToNFTTransfer[
                receivedEvent.transactionHash
              ]) {
                if (
                  nftTransfer.buyer == senderERC &&
                  nftTransfer.seller == receiverERC
                ) {
                  nftTransfer.bought_with_token =
                    ercTransfer.address.toLowerCase();

                  if (ercTransfer?.data == "0x") {
                    let freferf;
                  }
                  try {
                    nftTransfer.token_amount =
                      String(
                        BigInt(ercTransfer?.data || "0") / BigInt(divider)
                      ) || "0";

                    finalNFTTransfers.push(nftTransfer);
                  } catch (e) {
                    let fererf;
                  }

                  let ffeferf;
                }
              }
            }
          }

          let frefe;
        } catch (e: any) {
          console.info(`ERROR pipeline2: ${e?.message || e}`);
        }
      });

      resolve2(null);
    });

    const transactionsForValue: string[] = [];

    await new Promise(async (resolve3) => {
      pipeline2.on("end", () => {
        for (const hash of Object.keys(getterHashToNFTTransfer || [])) {
          for (const nftTransfer of getterHashToNFTTransfer[hash] || []) {
            if (
              !nftTransfer?.token_amount ||
              (nftTransfer?.token_amount == "0" &&
                !transactionsForValue.includes(hash))
            ) {
              transactionsForValue.push(hash);
            }
          }
        }
        resolve3(null);
      });
    });

    console.info(
      `Checking if should load tx-values for ${currentAsset.contract}`
    );
    if (await shouldLoad(currentAsset.contract + "-" + "tx-values.json")) {
      console.info(`Loading tx-values for ${currentAsset.contract}`);
      await fetchAllValues({
        hashes: transactionsForValue,
        collection: currentAsset.contract.toLowerCase(),
        blockchain: blockchain,
        proxies: proxies,
        range: 50,
      });
    } else {
      console.info(`Not loading tx-values for ${currentAsset.contract}`);
    }

    const pipeline3 = chain([
      fs.createReadStream(
        "logs/" + currentAsset.contract + "-" + "tx-values.json"
      ),
      parser(),
      pick({ filter: "data" }),
      streamArray(),
    ]);

    await new Promise(async (resolve4) => {
      pipeline3.on("data", async (data: any) => {
        try {
          const tx = data.value as Transaction;
          if (getterHashToNFTTransfer[tx.hash]) {
            const nftTransfers = getterHashToNFTTransfer[tx.hash];
            const divider = getterHashToAmountOfTransferedNfts[tx.hash];
            finalNFTTransfers;
            for (const nftTransfer of nftTransfers || []) {
              nftTransfer.value = toNumber(
                BigInt(tx.value) / BigInt(divider),
                18
              );
              //GERER ETH HISTORY
              nftTransfer.trade_value =
                nftTransfer.value * getterChainToETHPrice["Ethereum"];
              finalNFTTransfers.push(nftTransfer);
              let ferer;
            }
          }

          let frefe;
        } catch (e: any) {
          console.info(`ERROR pipeline3: ${e?.message || e}`);
        }
      });

      resolve4(null);
    });

    pipeline3.on("end", async (data: any) => {
      console.info(`finished on pipeline3`);
      finalNFTTransfers;
      let priced = 0;
      let freeMint = 0;
      for (const nftTransfer of finalNFTTransfers || []) {
        if (nftTransfer.trade_value > 0 && nftTransfer.type != "mint") {
          priced++;
        } else if (nftTransfer.trade_value == 0 && nftTransfer.type == "mint") {
          freeMint++;
        }
      }
      console.info(`priced trades: ${priced}   free mint: ${freeMint}`);
      let frfe;
    });
  }
}

export async function fetchInternalTransactions(hash: string): Promise<any> {
  const root =
    "https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=";

  const url = root + hash;

  let fetched = false;
  let errCount = 0;
  let res = null;

  while (!fetched && errCount < 5) {
    fetched = await new Promise(async (resolve) => {
      const TO = setTimeout(() => {
        resolve(false);
      }, 2500);

      try {
        const data = await fetch(url, {
          agent: new HttpsProxyAgent("PROTECTION ANTI HACKER"),
        });
        clearTimeout(TO);
        res = await data.json();
        resolve(true);
      } catch (e) {
        errCount++;
        resolve(false);
      }
    });
  }
  return res;
}

export async function fetchUnmatchedHashes(
  hashes: string[]
): Promise<TransactionReceipt[]> {
  const receipts: TransactionReceipt[] = [];

  console.log(`Should fetch ${hashes.length} transaction receipts`);

  return receipts;
}
