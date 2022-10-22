"use strict";
exports.__esModule = true;
var path_1 = require("path");
var dotenv_1 = require("dotenv");
// Parsing the env file.
dotenv_1["default"].config({ path: path_1["default"].resolve(__dirname, ".env") });
// Loading process.env as ENV interface
var getConfig = function () {
    return {
        SLACK_HOOK: "https://hooks.slack.com/services/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",
        SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsY3h2ZmJtcXp3aW55bWNqbG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY2MDIxMzEzOSwiZXhwIjoxOTc1Nzg5MTM5fQ.Pv5rENBrJQ3kOpxoSfcQWgfI8G5FuWyWvmZzynD_gQ4",
        SUPABASE_PAIRS_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWV2d2xnZG9scmNmeHp2cWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY2MDgxNjk1OCwiZXhwIjoxOTc2MzkyOTU4fQ.a1_usnpgO8rkp4-Az1dnqSCaIQ1nQN8WQuDM_PuNm1Q",
        BLOCK: '21349027',
        RESTART: 'true'
    };
};
// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.
var getSanitzedConfig = function (config) {
    for (var _i = 0, _a = Object.entries(config); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value === undefined) {
            throw new Error("Missing key ".concat(key, " in config.env"));
        }
    }
    return config;
};
var config = getConfig();
var sanitizedConfig = getSanitzedConfig(config);
exports["default"] = sanitizedConfig;
