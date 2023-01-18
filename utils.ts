import axios from "axios";
import { ethers } from "ethers";
import fs from "fs";
import { config } from "./config";
import { DEAD_WALLETS, providers } from "./constants/crypto";
import { readLastChar } from "./files";
import { MagicWeb3 } from "./MagicWeb3";
export const restartSettings = {
  block: (config.BLOCK as unknown as string)
    ? parseInt(config.BLOCK as unknown as string)
    : 0,
  restart: true, // config.RESTART === "true",
  debug: false,
  noRestart: false,
};

export const sendSlackMessage = async (channel: string, text: string) => {
  if (!config.SLACK_HOOK) return;
  try {
    await axios.post(config.SLACK_HOOK as unknown as string, {
      channel,
      text,
    });
  } catch (e) {
    // console.warn(e);
  }
};

export const shouldLoad = async (name: string) => {
  if (restartSettings.noRestart) return true;
  if (fs.existsSync("logs/" + name)) {
    try {
      const lastChar = await readLastChar(name);
      console.log("Red last char: " + lastChar);
      return lastChar !== "}";
    } catch (e) {
      console.log("Error: " + e + " - should load.");
      return true;
    }
  }
  console.log("File does not exist - should load.");
  return true;
};

export function getEthPrice(
  blockNumber: number,
  price_history: [number, number][]
) {
  let maxDist = Infinity;
  let bestPrice = 0;

  for (let i = 0; i < price_history.length; i++) {
    if (Math.abs(price_history[i][0] - blockNumber) < maxDist) {
      maxDist = Math.abs(price_history[i][0] - blockNumber);
      bestPrice = price_history[i][1];
    }
  }

  return bestPrice;
}

export function printMemoryUsage() {
  const memoryData = process.memoryUsage();

  const formatMemoryUsage = (data: number) =>
    `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

  const memoryUsage = {
    rss: `${formatMemoryUsage(
      memoryData.rss
    )} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(
      memoryData.heapTotal
    )} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(
      memoryData.heapUsed
    )} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };

  console.log(memoryUsage);
}

export async function getCirculatingSupply(
  total_supply_contracts: string[],
  circulating_supply_addresses: string[],
  contracts: string[],
  blockchains: string[]
) {
  let total_supply = BigInt(0);
  for (const contract of total_supply_contracts) {
    const blockchain = blockchains[contracts.indexOf(contract)];

    if (providers[blockchain]) {
      try {
        const tokenDecimals = await new ethers.Contract(
          contract,
          ["function decimals() external view returns (uint256)"],
          providers[blockchain]
        ).decimals();

        if (tokenDecimals.toNumber() > 0) {
          total_supply += (
            await new ethers.Contract(
              contract,
              ["function totalSupply() external view returns (uint256)"],
              providers[blockchain]
            ).totalSupply()
          )
            .div(ethers.utils.parseUnits("10", tokenDecimals.toNumber() - 1))
            .toBigInt();
        } else {
          total_supply += (
            await new ethers.Contract(
              contract,
              ["function totalSupply() external view returns (uint256)"],
              providers[blockchain]
            ).totalSupply()
          ).toBigInt();
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  let circulating_supply = total_supply;

  circulating_supply_addresses =
    circulating_supply_addresses.concat(DEAD_WALLETS);
  //For now, supposing that the circulating supply addresses are coming from the main blockchain of the project

  let tokenDecimals;

  if (providers[blockchains[0]]) {
    tokenDecimals = await new ethers.Contract(
      contracts[0],
      ["function decimals() external view returns (uint256)"],
      providers[blockchains[0]]
    ).decimals();
  }

  for (const address of circulating_supply_addresses) {
    if (providers[blockchains[0]]) {
      if (tokenDecimals.toNumber() > 0) {
        circulating_supply -= (
          await new ethers.Contract(
            contracts[0],
            [
              "function balanceOf(address account) external view returns (uint256)",
            ],
            providers[blockchains[0]]
          ).balanceOf(address)
        )
          .div(ethers.utils.parseUnits("10", tokenDecimals.toNumber() - 1))
          .toBigInt();
      } else {
        circulating_supply -= (
          await new ethers.Contract(
            contracts[0],
            [
              "function balanceOf(address account) external view returns (uint256)",
            ],
            providers[blockchains[0]]
          ).balanceOf(address)
        ).toBigInt();
      }
    }
  }

  return { circulatingSupply: Number(circulating_supply) };
}

export const types = ["liquidity", "volume", "price", "total_volume"];

export function fetchEntry(
  entry: [number, number][],
  timestamp: number
): number | null {
  for (let i = 0; i < entry.length; i++) {
    if (entry[i][0] === timestamp) return i;
  }
  return null;
}

export async function getBlockToTimestamp(
  magicProvider: MagicWeb3,
  blockNumber: number
): Promise<number> {
  const blockResponses: any[] = [];
  let blockTimestamp = 0;
  console.log(`getBlockToTimestamp(): should fetch block ${blockNumber}`);
  blockResponses.push(
    new Promise(async (resolveTop) => {
      let errCount = 0;
      let fetchedBlock = false;
      while (!fetchedBlock) {
        try {
          fetchedBlock = await new Promise(async (resolveBlock) => {
            try {
              const TO = setTimeout(() => {
                console.log(
                  `getBlockToTimestamp(): timeout for block ${blockNumber}, re-fetching...`
                );
                resolveBlock(false);
              }, 5000);

              const bufferBlock = await magicProvider
                .eth()
                .getBlock(blockNumber);
              if (bufferBlock?.number && bufferBlock?.timestamp) {
                blockTimestamp = Number(bufferBlock.timestamp) * 1000;
                clearTimeout(TO);
                resolveBlock(true);
              } else {
                errCount++;
                clearTimeout(TO);
                resolveBlock(false);
              }
            } catch (e) {
              if (errCount > 20) {
                process.exit(666);
              }
              errCount++;
              console.error(
                `getBlockToTimestamp() error in inner promise, re-trying... ${
                  e?.message ? e.message : e
                }`
              );
            }
          });
        } catch (e) {
          if (errCount > 20) {
            process.exit(666);
          }
          errCount++;
          console.error(
            `getBlockToTimestamp() handled error: ${e?.message ? e.message : e}`
          );
        }

        if (errCount > 20) {
          process.exit(666);
        }
      }
      resolveTop(null);
    })
  );

  await Promise.all(blockResponses);

  return blockTimestamp;
}
