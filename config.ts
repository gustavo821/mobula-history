import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  SLACK_HOOK: string | undefined;
  SUPABASE_KEY: string | undefined;
  SUPABASE_PAIRS_KEY: string | undefined;
  BLOCK: string | undefined;
  RESTART: string | undefined;
}

interface Config {
  SLACK_HOOK: string;
  SUPABASE_KEY: string;
  SUPABASE_PAIRS_KEY: string;
  BLOCK: string;
  RESTART: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    SLACK_HOOK: process.env.SLACK_HOOK,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_PAIRS_KEY: process.env.SUPABASE_PAIRS_KEY,
    BLOCK: process.env.BLOCK,
    RESTART: process.env.RESTART,
  };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
