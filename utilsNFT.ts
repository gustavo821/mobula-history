import { Log } from "@ethersproject/providers";
import { ethers } from "ethers";
import { ENS_REGISTRAR_ABI, OPENSEA_SEAPORT_ABI, X2Y2_ABI } from "./abis";
import {
  ENSNameRegisteredEvent,
  IBlockWithTransactions,
  openSeaOrderFulfilledEvent,
  supportedRPCs,
  X2Y2Event,
} from "./constants/crypto";
import { toNumberHighPrecision } from "./utilsV3";

export function formatENSEvent(
  getterChainToETHPrice: { [index: string]: number },
  event: Log,
  _blockchain: string
): ITransferNFT {
  try {
    const ENSInterface = new ethers.utils.Interface(ENS_REGISTRAR_ABI);
    const decodedData = ENSInterface.decodeEventLog(
      ENSNameRegisteredEvent,
      event.data
    );

    const bufferValue = toNumberHighPrecision(
      BigInt(decodedData.cost._hex),
      19
    );

    const formattedEvent: ITransferNFT = {
      collection: "ENS NAMES",
      buyer: String(
        ethers.utils.defaultAbiCoder.decode(["address"], event.topics[2])
      ).toLowerCase(),
      seller: "ENS: ETH Registrar Controller",
      id: decodedData.name + ".eth",
      blockchain: _blockchain,
      hash: event.transactionHash,
      type: "mint",
      value: bufferValue,
      marketplace: "ENS: ETH Registrar Controller",
      bought_with_token: null,
      token_amount: "0",
      NFT: true,
      collection_name: "ENS NAMES",
      timestamp: 0,
      blockNumber: 0,
      trade_value: getterChainToETHPrice[_blockchain]
        ? bufferValue * getterChainToETHPrice[_blockchain]
        : 0,
    };
    return formattedEvent;
  } catch (e) {
    console.error(`NFT: formatENSEvent error: ${e.message}`);
    return null as unknown as ITransferNFT;
  }
}

export function formatX2Y2Event(
  getterChainToETHPrice: { [index: string]: number },
  event: Log,
  _blockchain: string
): ITransferNFT {
  const X2Y2Interface = new ethers.utils.Interface(X2Y2_ABI);
  const decodedData = X2Y2Interface.decodeEventLog(X2Y2Event, event.data);
  const collection = ethers.utils.defaultAbiCoder.decode(
    ["uint256", "uint256", "address", "uint256"],
    decodedData.item.data
  );
  try {
    const fee =
      decodedData.detail.fees?.length > 0
        ? Number(BigInt(decodedData.detail.fees[0].percentage._hex).toString())
        : 0;

    const bufferValue =
      toNumberHighPrecision(BigInt(decodedData.item.price._hex), 18) *
      (1 - fee / 1000000);

    const formattedEvent: ITransferNFT = {
      collection: collection[2].toLowerCase(),
      buyer: decodedData.taker.toLowerCase(),
      seller: decodedData.maker.toLowerCase(),
      id: BigInt(collection[3]).toString(),
      blockchain: _blockchain,
      hash: event.transactionHash,
      type: "transfer",
      value: bufferValue,
      marketplace: "X2Y2",
      bought_with_token: null,
      token_amount: "0",
      NFT: true,
      timestamp: 0,
      blockNumber: 0,
      trade_value: getterChainToETHPrice[_blockchain]
        ? Number((bufferValue * getterChainToETHPrice[_blockchain]).toFixed(4))
        : 0,
    };
    return formattedEvent;
  } catch (e) {
    console.error(`NFT: formatENSEvent error: ${e.message}`);
    return null as unknown as ITransferNFT;
  }
}

export function formatOpenSeaEvent(
  getterChainToETHPrice: { [index: string]: number },
  event: Log,
  _blockchain: string
): ITransferNFT {
  const seaportInterface = new ethers.utils.Interface(OPENSEA_SEAPORT_ABI);
  let decodedData: ethers.utils.Result; //leave it as "let" to access it in the catch
  const formattedEvent: ITransferNFT = {
    collection: "",
    buyer: "",
    seller: "",
    id: "",
    blockchain: _blockchain,
    hash: event.transactionHash,
    type: "transfer",
    value: 0,
    marketplace: "",
    bought_with_token: null,
    token_amount: "0",
    NFT: true,
    timestamp: 0,
    trade_value: 0,
    blockNumber: 0,
  };

  try {
    decodedData = seaportInterface.decodeEventLog(
      openSeaOrderFulfilledEvent,
      event.data
    );

    if (
      decodedData.consideration[0].token ==
      "0x0000000000000000000000000000000000000000"
    ) {
      const bufferValue = toNumberHighPrecision(
        BigInt(decodedData.consideration[0].amount._hex),
        18
      );

      //payment in ether
      (formattedEvent.collection = decodedData.offer[0].token.toLowerCase()),
        (formattedEvent.id = BigInt(
          decodedData.offer[0].identifier._hex
        ).toString()),
        (formattedEvent.buyer = decodedData.recipient.toLowerCase()),
        (formattedEvent.seller =
          decodedData.consideration[0].recipient.toLowerCase()),
        (formattedEvent.value = bufferValue),
        (formattedEvent.marketplace = "OpenSea port 1.1"),
        (formattedEvent.trade_value = getterChainToETHPrice[_blockchain]
          ? Number(
              (bufferValue * getterChainToETHPrice[_blockchain]).toFixed(4)
            )
          : 0);
    } else if (
      decodedData.offer[0].itemType == 2 ||
      decodedData.offer[0].itemType == 3
    ) {
      (formattedEvent.collection = decodedData.offer[0].token.toLowerCase()),
        (formattedEvent.id = BigInt(
          decodedData.offer[0].identifier._hex
        ).toString()),
        (formattedEvent.buyer = decodedData.recipient.toLowerCase()),
        (formattedEvent.seller =
          decodedData.consideration[0].recipient.toLowerCase()),
        (formattedEvent.bought_with_token =
          decodedData.consideration[0].token.toLowerCase()),
        (formattedEvent.token_amount = BigInt(
          decodedData.consideration[0].amount._hex
        ).toString()),
        (formattedEvent.marketplace = "OpenSea port 1.1");
    } else {
      (formattedEvent.collection =
        decodedData.consideration[0].token.toLowerCase()),
        (formattedEvent.id = BigInt(
          decodedData.consideration[0].identifier._hex
        ).toString()),
        (formattedEvent.buyer =
          decodedData.consideration[0].recipient.toLowerCase()),
        (formattedEvent.seller = decodedData.recipient.toLowerCase()),
        (formattedEvent.bought_with_token =
          decodedData.offer[0].token.toLowerCase()),
        (formattedEvent.token_amount = BigInt(
          decodedData.offer[0].amount._hex
        ).toString()),
        (formattedEvent.marketplace = "OpenSea port 1.1");
    }
  } catch (e) {
    console.error(
      `formatOpenSeaEvent:error ${event.transactionHash} ${e.message}`
    );
  }

  return formattedEvent;
}

export function formatERCTransferEvent(
  event: Log,
  _blockchain: string
): ITokenTransfer {
  try {
    const bufferFrom = String(
      ethers.utils.defaultAbiCoder.decode(["address"], event.topics[1])
    ).toLowerCase();
    const bufferTransfer: ITokenTransfer = {
      token: event.address.toLowerCase(),
      from: bufferFrom,
      to: String(
        ethers.utils.defaultAbiCoder.decode(["address"], event.topics[2])
      ).toLowerCase(),
      blockchain: _blockchain,
      hash: event.transactionHash,
      amount: String(
        ethers.utils.defaultAbiCoder.decode(["uint256"], event.data)
      ),
    };

    return bufferTransfer;
  } catch (e) {
    console.error(`formatERCTransferEvent: ${e.message}`);
    return null as unknown as ITokenTransfer;
  }
}

export async function loadBlocksLocally(
  getterBlockNumberToTimestamp: { [index: string]: number },
  chain: string,
  fromBlock: number,
  toBlock: number
): Promise<IBlockWithTransactions[]> {
  const blockResponses: any[] = [];
  const provider = ethers.getDefaultProvider(supportedRPCs[chain][0]);
  const fullBlocks: IBlockWithTransactions[] = [] as IBlockWithTransactions[];
  let receivedResponses = 0;
  for (let block = fromBlock; block <= toBlock; block++) {
    blockResponses.push(
      new Promise(async (resolve) => {
        let receivedBlock = false;
        while (!receivedBlock) {
          try {
            console.log(`loadBlocksLocally: Fetching block ${block}`);
            const bufferBlock = await provider.getBlockWithTransactions(block);
            fullBlocks.push(bufferBlock);
            getterBlockNumberToTimestamp[bufferBlock.number] =
              bufferBlock.timestamp * 1000;
            receivedBlock = true;

            console.log(
              `loadBlocksLocally: ${receivedResponses}/${blockResponses.length}`
            );
            receivedResponses++;
            resolve(null);
          } catch (e) {
            receivedBlock = false;
            console.warn(
              `Error while getting full block ${block} with ethers: ${e.message}`
            );
            await delay(1500);
          }
        }
      })
    );
  }

  await Promise.all(blockResponses);

  return fullBlocks;
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const NFTExchanges = [
  "0x74312363e45dcaba76c59ec49a7aa8a65a67eed3", //X2Y2 ETH
  "0x00000000006c3852cbef3e08e8df289169ede581", //OpenSea Seaport 1.1
  "0x283af0b28c62c092c9727f1ee09c02ca627eb7f5", //ENS
];

export interface ITokenTransfer {
  token: string;
  from: string;
  to: string;
  amount: string;
  blockchain: string;
  hash: string;
}

export interface ITransferNFT {
  collection: string;
  buyer: string;
  seller: string;
  id: string;
  blockchain: string;
  hash: string;
  type: "mint" | "transfer" | "burn";
  value: null | number;
  marketplace: string;
  NFT: boolean;
  bought_with_token: null | string;
  token_amount: string;
  collection_name?: string;
  uri?: string;
  metadata?: any;
  trade_value: number;
  timestamp: number;
  blockNumber: number;
}
