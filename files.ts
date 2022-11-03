import fs from "fs";
import { Log } from "web3-core";
import { restartSettings } from "./utils";

export const readLastChar = async (name: string) => {
  return new Promise((resolve) => {
    fs.stat("logs/" + name, function postStat(_, stats) {
      fs.open("logs/" + name, "r", function postOpen(_, fd) {
        fs.read(
          fd,
          Buffer.alloc(1),
          0,
          1,
          stats.size - 1,
          function postRead(_, __, buffer) {
            resolve(buffer.toString("utf8"));
          }
        );
      });
    });
  });
};

export const readLastBlock = async (name: string) => {
  if (fs.existsSync("logs/" + name)) {
    if (restartSettings.debug) {
      try {
        fs.copyFileSync("logs/" + name, "logs/" + name + Date.now());
      } catch (e) {
        console.log("First catch", e);
      }
    }

    try {
      const end = (await new Promise((resolve) => {
        fs.stat("logs/" + name, function postStat(_, stats) {
          fs.open("logs/" + name, "r", function postOpen(_, fd) {
            fs.read(
              fd,
              Buffer.alloc(2000),
              0,
              2000,
              stats.size - 2000,
              function postRead(_, __, buffer) {
                resolve(buffer.toString("utf8"));
              }
            );
          });
        });
      })) as string;

      const block = end.split('"blockNumber":')[1].split(",")[0];
      if (!isNaN(parseInt(block))) {
        return parseInt(block);
      } else {
        return 0;
      }
    } catch (e) {
      return 0;
    }
  } else {
    return 0;
  }
};

export function openDataFile(filename: string) {
  console.log("Writing new file.");
  console.log(fs.writeFileSync("logs/" + filename, '{"data":['));
}

export function closeDataFile(filename: string) {
  console.log("Closing new file");
  console.log(fs.appendFileSync("logs/" + filename, "]}"));
}

export async function pushData(logs: Log[], filename: string, last: boolean) {
  console.log("Pushing", filename, last);

  if (logs.length == 0) {
    fs.appendFileSync("logs/" + filename, "[]" + (last ? "" : ","));
    return;
  }

  for (let i = 0; i < logs.length; i++) {
    // console.log(
    //   "adding ",
    //   JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ",")
    // );

    await new Promise((resolve) =>
      fs.appendFile(
        "logs/" + filename,
        JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ","),
        () => resolve(null)
      )
    );
  }

  console.log("Pushing " + logs.length + " events.");
}
