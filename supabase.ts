import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";

export async function getShardedPairsFromTokenId(id: number): Promise<any[]> {
  const hexa = "0123456789abcdef";
  const supabasePairs = await createPairsSupabaseClient();
  const responses = [];
  const finalArray: any[] = [];
  const timeBefore = Date.now();
  for (const hexaChar of hexa) {
    responses.push(
      new Promise(async (resolve) => {
        let fetchedData = false;
        while (!fetchedData) {
          try {
            const { count } = (await supabasePairs
              .from(`0x${hexaChar}`)
              .select("id", { count: "exact" })
              .or(`token0_id.eq.${id},token1_id.eq.${id}`)) as any;

            for (let i = 0; i < count; i += 100) {
              const { data, error } = (await supabasePairs
                .from(`0x${hexaChar}`)
                .select("*")
                .or(`token0_id.eq.${id},token1_id.eq.${id}`)
                .range(i, i + 100)) as any;

              if (error) {
                throw `Supabase => ${error.message}`;
              }

              for (const pair of data) {
                finalArray.push(pair);
              }
            }

            fetchedData = true;
            resolve(null);
          } catch (e) {
            fetchedData = false;
            console.error(`Error getShardedPairsFromTokenId: ${e}`);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      })
    );
  }

  await Promise.all(responses);
  const timeAfter = Date.now();
  console.log(
    `getShardedPairsFromTokenId resolved 16 queries in ${
      (timeAfter - timeBefore) / 1000
    } sec`
  );
  return finalArray;
}

export async function getShardedPairsFromAddresses(
  addresses: string[]
): Promise<any[]> {
  const hexa = "0123456789abcdef";
  const supabasePairs = await createPairsSupabaseClient();
  const responses = [];
  const finalArray: any[] = [];
  const timeBefore = Date.now();
  for (const hexaChar of hexa) {
    responses.push(
      new Promise(async (resolve) => {
        let fetchedData = false;
        while (!fetchedData) {
          try {
            const { data, error } = (await supabasePairs
              .from(`0x${hexaChar}`)
              .select("*")
              .in("address", addresses)) as any;

            if (error) {
              throw `Supabase => ${error.message}`;
            }

            for (const pair of data) {
              finalArray.push(pair);
            }
            fetchedData = true;
            resolve(null);
          } catch (e) {
            fetchedData = false;
            console.error(`Error getShardedPairsFromTokenId: ${e}`);
            await new Promise((r) => setTimeout(() => r(null), 1000));
          }
        }
      })
    );
  }

  await Promise.all(responses);
  const timeAfter = Date.now();
  console.log(
    `getShardedPairsFromTokenId resolved 16 queries in ${
      (timeAfter - timeBefore) / 1000
    } sec`
  );
  return finalArray;
}

export const createPairsSupabaseClient = () => {
  return new MetaSupabase();
};

export class MetaSupabase {
  clusters: { [index: string]: SupabaseClient };
  tables: { [index: string]: string[] };

  constructor() {
    this.tables = {
      "pairs-1": ["0x0", "0x1", "0x2", "0x3"],
      "pairs-2": ["0x4", "0x5", "0x6", "0x7"],
      "pairs-3": ["0x8", "0x9", "0xa", "0xb"],
      "pairs-4": ["0xc", "0xd", "0xe", "0xf"],
    };

    this.clusters = {
      "pairs-1": createClient(
        "https://yggsdmqfwpntpjbdnpfo.supabase.co",
        config.PAIRS1
      ),
      "pairs-2": createClient(
        "https://lisnecmeheedtflucdxy.supabase.co",
        config.PAIRS2
      ),
      "pairs-3": createClient(
        "https://cganiivuxawwfdqtebjk.supabase.co",
        config.PAIRS3
      ),
      "pairs-4": createClient(
        "https://eznupqzoqqsywujpqbsf.supabase.co",
        config.PAIRS4
      ),
      default: createClient(
        "https://ylcxvfbmqzwinymcjlnx.supabase.co",
        config.DEFAULT
      ),
    };
  }

  getRightSupabase(table: string) {
    for (const cluster of Object.keys(this.clusters)) {
      if (this.tables[cluster]?.includes(table)) {
        console.log("wtf", cluster);
        return this.clusters[cluster];
      }
    }
    return this.clusters["default"];
  }

  from(table: string) {
    return this.getRightSupabase(table).from(table);
  }
}

export async function getForSure(promise: Promise<any>) {
  let success = false;
  while (!success) {
    try {
      return await promise;
    } catch (e) {
      console.log(e);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
