"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var web3_1 = require("web3");
var MagicWeb3_1 = require("./MagicWeb3");
var stream_chain_1 = require("stream-chain");
var stream_json_1 = require("stream-json");
var Pick_1 = require("stream-json/filters/Pick");
var StreamArray_1 = require("stream-json/streamers/StreamArray");
var config_1 = require("./config");
var fs_1 = require("fs");
var ethers_1 = require("ethers");
var supabase_js_1 = require("@supabase/supabase-js");
var colorette_1 = require("colorette");
var crypto_1 = require("./constants/crypto");
var axios_1 = require("axios");
var supabase = (0, supabase_js_1.createClient)("https://ylcxvfbmqzwinymcjlnx.supabase.co", config_1["default"].SUPABASE_KEY);
var supabasePairsClient = (0, crypto_1.createPairsSupabaseClient)();
var supportedRPCs = {
    "Avalanche C-Chain": ["https://api.avax.network/ext/bc/C/rpc"],
    "BNB Smart Chain (BEP20)": [
        "https://bsc-dataseed.binance.org/",
        "https://bsc-dataseed2.binance.org/",
        // "https://bsc-dataseed3.binance.org/",
        // "https://bsc-dataseed4.binance.org/",
        // "https://bsc-dataseed1.defibit.io/",
        // "https://bsc-dataseed2.defibit.io/",
        // "https://bsc-dataseed3.defibit.io/",
        // "https://bsc-dataseed4.defibit.io/",
        // "https://bsc-dataseed1.ninicoin.io/",
        // "https://bsc-dataseed2.ninicoin.io/",
        // "https://bsc-dataseed3.ninicoin.io/",
        // "https://bsc-dataseed4.ninicoin.io/",
    ],
    Ethereum: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    Fantom: ["https://rpc.ftm.tools/"],
    Polygon: ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon"],
    Cronos: ["https://evm-cronos.crypto.org"],
    "Metis Andromeda": ["https://andromeda.metis.io/owner1088"],
    Aurora: ["https://mainnet.aurora.dev"],
    Arbitrum: ["https://rpc.ankr.com/arbitrum"]
};
var RPCLimits = {
    "BNB Smart Chain (BEP20)": {
        queriesLimit: 0.3,
        maxRange: 100,
        timeout: 30000,
        timeoutPlus: 3000
    },
    Polygon: {
        queriesLimit: 1,
        maxRange: 2000,
        timeout: 100000,
        timeoutPlus: 2000
    },
    Ethereum: {
        queriesLimit: 2,
        maxRange: 200,
        timeout: 100000,
        timeoutPlus: 2000
    },
    Fantom: {
        queriesLimit: 1,
        maxRange: 5000,
        timeout: 100000,
        timeoutPlus: 2000
    },
    Cronos: {
        queriesLimit: 1,
        maxRange: 2000,
        timeout: 100000,
        timeoutPlus: 2000
    },
    // 'Metis Andromeda': { queriesLimit: 50, maxRange: 20000 },
    Arbitrum: {
        queriesLimit: 3,
        maxRange: 3000,
        timeout: 100000,
        timeoutPlus: 2000
    },
    // 'Aurora': { queriesLimit: 4, maxRange: 5000, timeout: 3000, timeoutPlus: 2000 },
    "Avalanche C-Chain": {
        queriesLimit: 3,
        maxRange: 2048,
        timeout: 100000,
        timeoutPlus: 2000
    }
};
var WETHAndStables = {
    "BNB Smart Chain (BEP20)": [
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x55d398326f99059ff775485246999027b3197955",
    ],
    Polygon: [
        "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    ],
    Ethereum: [
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    ],
    Fantom: [
        "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    ],
    Cronos: [
        "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
        "0xc21223249ca28397b4b6541dffaecc539bff0c59",
        "0x66e428c3f67a68878562e79a0234c1f83c208770",
    ],
    Arbitrum: [
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    ],
    "Avalanche C-Chain": [
        "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        "0xc7198437980c041c805a1edcba50c1ce5db95118",
        "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    ],
    Aurora: [
        "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79",
        "0x4988a896b1227218e4a686fde5eabdcabd91571f",
        "0xb12bfca5a55806aaf64e99521918a4bf0fc40802",
    ]
};
var swapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
var transferEvent = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
var createPairEvent = "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9";
var syncEvent = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1";
var restartSettings = {
    block: parseInt(config_1["default"].BLOCK) || 0,
    restart: config_1["default"].RESTART === "true"
};
var currentAsset;
function delay(time) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, time); })];
        });
    });
}
var shouldLoad = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var lastChar, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!restartSettings.restart)
                    return [2 /*return*/, true];
                if (!fs_1["default"].existsSync("logs/" + name)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, readLastChar(name)];
            case 2:
                lastChar = _a.sent();
                console.log("Red last char: " + lastChar);
                return [2 /*return*/, lastChar !== "}"];
            case 3:
                e_1 = _a.sent();
                console.log("Error: " + e_1 + " - should load.");
                return [2 /*return*/, true];
            case 4:
                console.log("File does not exist - should load.");
                return [2 /*return*/, true];
        }
    });
}); };
var readLastChar = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                fs_1["default"].stat("logs/" + name, function postStat(_, stats) {
                    fs_1["default"].open("logs/" + name, "r", function postOpen(_, fd) {
                        fs_1["default"].read(fd, Buffer.alloc(1), 0, 1, stats.size - 1, function postRead(_, __, buffer) {
                            resolve(buffer.toString("utf8"));
                        });
                    });
                });
            })];
    });
}); };
var sendSlackMessage = function (channel, text) { return __awaiter(void 0, void 0, void 0, function () {
    var e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1["default"].post(config_1["default"].SLACK_HOOK, {
                        channel: channel,
                        text: text
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                console.warn(e_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
console.log = function () {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    if (currentAsset) {
        fs_1["default"].appendFileSync("logs/" + currentAsset.name + ".logs", "\n[" + new Date().toISOString() + "] " + params.join(" "));
    }
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var proxies, _a, data, error, _loop_1, i;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0: return [4 /*yield*/, (0, MagicWeb3_1.loadProxies)(10)];
            case 1:
                proxies = _m.sent();
                console.log(restartSettings);
                return [4 /*yield*/, supabase
                        .from("assets")
                        .select("contracts,total_supply_contracts,circulating_supply_addresses,blockchains,id,name")
                        .match({ name: "BNB" })];
            case 2:
                _a = (_m.sent()), data = _a.data, error = _a.error;
                //.order("created_at", { ascending: false })
                // .lt("market_cap", 14_500_000)
                // .gt("market_cap", 0)
                //.match({ tried: false})) as any;
                // .match({ name: "Octaplex Network" })) as any;
                // .match({ name: "Spartan Protocol" })) as any;
                console.info(data, error);
                _loop_1 = function (i) {
                    var upToDateAsset, pairs_1, allPairs_1, existingPairs, j, existingPairsBuffer, j, k, entry, index, _o, _p, _q, _r, _s, _t, _u, _v, j, freshPairs_1, circulatingSupply, bufferCirculatingSupply, _w, liquidity_history, market_cap_history, price_history, volume_history, total_volume_history, bufferMarketCapHistory, _x, historyData, historyError, bufferMarketCapRecent, _y, assetData, assetError;
                    return __generator(this, function (_z) {
                        switch (_z.label) {
                            case 0:
                                currentAsset = data[i];
                                return [4 /*yield*/, supabase
                                        .from("assets")
                                        .select("tried")
                                        .match({ id: currentAsset.id })];
                            case 1:
                                upToDateAsset = (_z.sent()).data;
                                if (!(!(upToDateAsset === null || upToDateAsset === void 0 ? void 0 : upToDateAsset[0].tried) || true)) return [3 /*break*/, 28];
                                return [4 /*yield*/, supabase
                                        .from("assets")
                                        .update({ tried: true })
                                        .match({ id: data[i].id })];
                            case 2:
                                _z.sent();
                                console.log("Updated asset.");
                                if (!(data[i].blockchains && data[i].blockchains.length > 0)) return [3 /*break*/, 26];
                                console.log("Calling sharded pairs.");
                                return [4 /*yield*/, (0, crypto_1.getShardedPairsFromTokenId)(data[i].id)];
                            case 3:
                                pairs_1 = _z.sent();
                                console.log("Done calling sharded pairs.");
                                return [4 /*yield*/, sendSlackMessage("logs-dev-2", "Loading data for asset " + data[i].name)];
                            case 4:
                                _z.sent();
                                console.info("Loading data for asset " + data[i].name);
                                if (!(!data[i].total_pairs || data[i].total_pairs.length === 0)) return [3 /*break*/, 18];
                                return [4 /*yield*/, findAllPairs(proxies, data[i].contracts || [], data[i].blockchains || [])];
                            case 5:
                                pairs_1 = _z.sent();
                                allPairs_1 = [];
                                pairs_1.forEach(function (pair) {
                                    allPairs_1 = allPairs_1.concat(pair);
                                });
                                console.log(allPairs_1);
                                existingPairs = [];
                                j = 0;
                                _z.label = 6;
                            case 6:
                                if (!(j < allPairs_1.length)) return [3 /*break*/, 9];
                                return [4 /*yield*/, (0, crypto_1.getShardedPairsFromAddresses)(allPairs_1.slice(j, j + 150).map(function (pair) { return pair.address; }))];
                            case 7:
                                existingPairsBuffer = _z.sent();
                                console.log(allPairs_1.slice(j, j + 150).map(function (pair) { return pair.address; }));
                                existingPairs = existingPairs.concat(existingPairsBuffer);
                                _z.label = 8;
                            case 8:
                                j += 150;
                                return [3 /*break*/, 6];
                            case 9:
                                j = 0;
                                _z.label = 10;
                            case 10:
                                if (!(j < pairs_1.length)) return [3 /*break*/, 17];
                                k = 0;
                                _z.label = 11;
                            case 11:
                                if (!(k < pairs_1[j].length)) return [3 /*break*/, 16];
                                entry = pairs_1[j][k];
                                index = existingPairs
                                    .map(function (entry) { return entry.address; })
                                    .indexOf(entry.address);
                                console.log("========================================================");
                                console.log(entry, index);
                                console.log(existingPairs);
                                console.log("========================================================");
                                if (!(index >= 0)) return [3 /*break*/, 13];
                                console.log("The pair does exist, modifying.");
                                _p = (_o = console).log;
                                _r = (_q = JSON).stringify;
                                return [4 /*yield*/, supabasePairsClient
                                        .from("0x" + entry.address.toLowerCase()[2])
                                        .update({
                                        token0_id: entry.token0.address.toLowerCase() ==
                                            data[i].contracts[j].toLowerCase()
                                            ? data[i].id
                                            : existingPairs[index].token0_id,
                                        token1_id: entry.token1.address.toLowerCase() ==
                                            data[i].contracts[j].toLowerCase()
                                            ? data[i].id
                                            : existingPairs[index].token1_id
                                    })
                                        .match({ address: entry.address })];
                            case 12:
                                _p.apply(_o, [_r.apply(_q, [_z.sent()])]);
                                return [3 /*break*/, 15];
                            case 13:
                                console.log("The pair does not exist, inserting.");
                                _t = (_s = console).log;
                                _v = (_u = JSON).stringify;
                                return [4 /*yield*/, supabasePairsClient
                                        .from("0x" + entry.address.toLowerCase()[2])
                                        .insert({
                                        address: entry.address,
                                        token0_address: entry.token0.address,
                                        token0_type: entry.token0.type,
                                        token0_decimals: entry.token0.decimals,
                                        token0_priceUSD: 0,
                                        token0_id: entry.token0.address.toLowerCase() ==
                                            data[i].contracts[j].toLowerCase()
                                            ? data[i].id
                                            : null,
                                        token1_address: entry.token1.address,
                                        token1_type: entry.token1.type,
                                        token1_decimals: entry.token1.decimals,
                                        token1_priceUSD: 0,
                                        token1_id: entry.token1.address.toLowerCase() ==
                                            data[i].contracts[j].toLowerCase()
                                            ? data[i].id
                                            : null,
                                        pair_data: entry.pairData,
                                        created_at: new Date(entry.createdAt).toISOString(),
                                        blockchain: data[i].blockchains[j]
                                    })];
                            case 14:
                                _t.apply(_s, [_v.apply(_u, [_z.sent()])]);
                                _z.label = 15;
                            case 15:
                                k++;
                                return [3 /*break*/, 11];
                            case 16:
                                j++;
                                return [3 /*break*/, 10];
                            case 17: return [3 /*break*/, 19];
                            case 18:
                                for (j = 0; j < pairs_1.length; j++) {
                                    pairs_1[pairs_1[j].blockchain] = {
                                        address: pairs_1[j].address,
                                        token0: {
                                            address: pairs_1[j].token0_address,
                                            type: pairs_1[j].token0_type,
                                            decimals: pairs_1[j].token0_decimals
                                        },
                                        token1: {
                                            address: pairs_1[j].token1_address,
                                            type: pairs_1[j].token1_type,
                                            decimals: pairs_1[j].token1_decimals
                                        },
                                        pairData: pairs_1[j].pair_data,
                                        createdAt: pairs_1[j].created_at,
                                        priceUSD: pairs_1[j].token0_id == data[i].id
                                            ? pairs_1[j].token0_priceUSD
                                            : pairs_1[j].token1_priceUSD
                                    };
                                }
                                freshPairs_1 = [];
                                Object.keys(pairs_1).forEach(function (key) {
                                    freshPairs_1[data[i].indexOf(key)] = pairs_1[key];
                                });
                                _z.label = 19;
                            case 19:
                                if (pairs_1.length > 50) {
                                    Object.keys(RPCLimits).forEach(function (key) {
                                        RPCLimits[key].maxRange = RPCLimits[key].maxRange / 10;
                                    });
                                }
                                console.log("Done with pair stuff.");
                                circulatingSupply = 0;
                                if (!(((_b = data[i].total_supply_contracts) === null || _b === void 0 ? void 0 : _b.length) > 0)) return [3 /*break*/, 21];
                                return [4 /*yield*/, getCirculatingSupply(data[i].total_supply_contracts, data[i].circulating_supply_addresses, data[i].contracts, data[i].blockchains)];
                            case 20:
                                bufferCirculatingSupply = (_z.sent()).circulatingSupply;
                                circulatingSupply = bufferCirculatingSupply;
                                _z.label = 21;
                            case 21: return [4 /*yield*/, getMarketData(proxies, data[i].contracts, data[i].blockchains, pairs_1, circulatingSupply)];
                            case 22:
                                _w = _z.sent(), liquidity_history = _w.liquidity_history, market_cap_history = _w.market_cap_history, price_history = _w.price_history, volume_history = _w.volume_history, total_volume_history = _w.total_volume_history;
                                bufferMarketCapHistory = ((_c = data[i].total_supply_contracts) === null || _c === void 0 ? void 0 : _c.length) > 0
                                    ? {
                                        market_cap_history: market_cap_history.filter(function (entry) { return entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7; })
                                    }
                                    : {};
                                return [4 /*yield*/, supabase.from("history")["delete"]().match({ asset: data[i].id })];
                            case 23:
                                _z.sent();
                                return [4 /*yield*/, supabase
                                        .from("history")
                                        .insert(__assign({ liquidity_history: liquidity_history.filter(function (entry) { return entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7; }), price_history: price_history.filter(function (entry) { return entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7; }), volume_history: volume_history.filter(function (entry) { return entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7; }), total_volume_history: total_volume_history.filter(function (entry) { return entry[0] < Date.now() - 1000 * 60 * 60 * 24 * 7; }), asset: data[i].id }, bufferMarketCapHistory))
                                        .match({ asset: data[i].id })];
                            case 24:
                                _x = _z.sent(), historyData = _x.data, historyError = _x.error;
                                console.log(historyData);
                                console.log(historyError);
                                bufferMarketCapRecent = ((_d = data[i].total_supply_contracts) === null || _d === void 0 ? void 0 : _d.length) > 0
                                    ? {
                                        market_cap_history: {
                                            market_cap: market_cap_history.filter(function (entry) { return entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7; })
                                        }
                                    }
                                    : {};
                                return [4 /*yield*/, supabase
                                        .from("assets")
                                        .update(__assign({ liquidity_history: {
                                            liquidity: liquidity_history.filter(function (entry) { return entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7; })
                                        }, price_history: {
                                            price: price_history.filter(function (entry) { return entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7; })
                                        }, volume_history: {
                                            volume: volume_history.filter(function (entry) { return entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7; })
                                        }, total_volume_history: {
                                            total_volume: total_volume_history.filter(function (entry) { return entry[0] > Date.now() - 1000 * 60 * 60 * 24 * 7; })
                                        }, processed: true, price: ((_e = price_history[price_history.length - 1]) === null || _e === void 0 ? void 0 : _e[1]) || 0, total_volume: Math.round(((_f = total_volume_history[total_volume_history.length - 1]) === null || _f === void 0 ? void 0 : _f[1]) || 0), liquidity: Math.round(((_g = liquidity_history[liquidity_history.length - 1]) === null || _g === void 0 ? void 0 : _g[1]) || 0), market_cap: Math.round(((_h = market_cap_history[market_cap_history.length - 1]) === null || _h === void 0 ? void 0 : _h[1]) || 0), volume: Math.round(((_j = volume_history[volume_history.length - 1]) === null || _j === void 0 ? void 0 : _j[1]) || 0), tracked: ((_k = liquidity_history[liquidity_history.length - 1]) === null || _k === void 0 ? void 0 : _k[1]) !==
                                            undefined &&
                                            ((_l = liquidity_history[liquidity_history.length - 1]) === null || _l === void 0 ? void 0 : _l[1]) > 500, history_loaded: true }, bufferMarketCapRecent))
                                        .match({ id: data[i].id })];
                            case 25:
                                _y = _z.sent(), assetData = _y.data, assetError = _y.error;
                                console.log(JSON.stringify(assetData));
                                console.log(JSON.stringify(assetError));
                                console.log("Done with asset.");
                                _z.label = 26;
                            case 26: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                            case 27:
                                _z.sent();
                                _z.label = 28;
                            case 28: return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _m.label = 3;
            case 3:
                if (!(i < data.length)) return [3 /*break*/, 6];
                return [5 /*yield**/, _loop_1(i)];
            case 4:
                _m.sent();
                _m.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/];
        }
    });
}); })();
function findAllPairs(proxies, contracts, blockchains) {
    return __awaiter(this, void 0, void 0, function () {
        var crossChainFormattedPairs, _loop_2, i;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    crossChainFormattedPairs = [];
                    console.log(proxies.length, "proxies loaded.");
                    _loop_2 = function (i) {
                        var formattedPairs_1, maybePairs, pairsIterations, _loop_3, _i, maybePairs_1, pair;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!RPCLimits[blockchains[i]]) return [3 /*break*/, 8];
                                    formattedPairs_1 = [];
                                    return [4 /*yield*/, shouldLoad(contracts[i] + "-" + "pairs0.json")];
                                case 1:
                                    if (!_b.sent()) return [3 /*break*/, 3];
                                    return [4 /*yield*/, loadOnChainData({
                                            topics: [
                                                createPairEvent,
                                                "0x000000000000000000000000" + contracts[i].split("0x")[1],
                                            ],
                                            blockchain: blockchains[i],
                                            genesis: 0,
                                            proxies: proxies,
                                            name: contracts[i] + "-" + "pairs0.json"
                                        })];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3: return [4 /*yield*/, shouldLoad(contracts[i] + "-" + "pairs1.json")];
                                case 4:
                                    if (!_b.sent()) return [3 /*break*/, 6];
                                    return [4 /*yield*/, loadOnChainData({
                                            topics: [
                                                createPairEvent,
                                                null,
                                                "0x000000000000000000000000" + contracts[i].split("0x")[1],
                                            ],
                                            blockchain: blockchains[i],
                                            genesis: 0,
                                            proxies: proxies,
                                            name: contracts[i] + "-" + "pairs1.json"
                                        })];
                                case 5:
                                    _b.sent();
                                    _b.label = 6;
                                case 6:
                                    maybePairs = JSON.parse(fs_1["default"].readFileSync("logs/" + contracts[i] + "-" + "pairs0.json"))
                                        .data.concat(JSON.parse(fs_1["default"].readFileSync("logs/" + contracts[i] + "-" + "pairs1.json")).data)
                                        .filter(function (entry) { return entry.address; });
                                    console.log(contracts[i] + "-" + "pairs1.json");
                                    pairsIterations = [];
                                    _loop_3 = function (pair) {
                                        pairsIterations.push(new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                            var token0Address, decimalsToken0, token1Address, decimalsToken1, e_3;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 3, , 4]);
                                                        token0Address = "0x" +
                                                            pair.topics[1]
                                                                .split("0x000000000000000000000000")[1]
                                                                .toLowerCase();
                                                        return [4 /*yield*/, new MagicWeb3_1.MagicWeb3(supportedRPCs[blockchains[i]][0], [proxies[Math.floor(Math.random() * proxies.length)]])
                                                                .contract(crypto_1.ERC20ABI, token0Address)
                                                                .methods.decimals()
                                                                .call()];
                                                    case 1:
                                                        decimalsToken0 = _a.sent();
                                                        token1Address = "0x" +
                                                            pair.topics[2]
                                                                .split("0x000000000000000000000000")[1]
                                                                .toLowerCase();
                                                        return [4 /*yield*/, new MagicWeb3_1.MagicWeb3(supportedRPCs[blockchains[i]][0], [proxies[Math.floor(Math.random() * proxies.length)]])
                                                                .contract(crypto_1.ERC20ABI, token1Address)
                                                                .methods.decimals()
                                                                .call()];
                                                    case 2:
                                                        decimalsToken1 = _a.sent();
                                                        console.log((0, colorette_1.green)("Pushing new pair"));
                                                        formattedPairs_1.push({
                                                            address: "0x" +
                                                                pair.data.split("0x000000000000000000000000")[1].slice(0, 40),
                                                            token0: {
                                                                address: token0Address,
                                                                type: WETHAndStables[blockchains[i]].includes(token0Address)
                                                                    ? WETHAndStables[blockchains[i]][0] == token0Address
                                                                        ? "eth"
                                                                        : "stable"
                                                                    : "other",
                                                                decimals: Number(decimalsToken0)
                                                            },
                                                            token1: {
                                                                address: token1Address,
                                                                type: WETHAndStables[blockchains[i]].includes(token1Address)
                                                                    ? WETHAndStables[blockchains[i]][0] == token1Address
                                                                        ? "eth"
                                                                        : "stable"
                                                                    : "other",
                                                                decimals: Number(decimalsToken1)
                                                            },
                                                            pairData: {
                                                                volumeToken0: 0,
                                                                volumeToken1: 0,
                                                                volumeUSD: 0,
                                                                reserve0: 0,
                                                                reserve1: 0,
                                                                reserveUSD: 0
                                                            },
                                                            createdAt: pair.blockNumber,
                                                            priceUSD: 0
                                                        });
                                                        return [3 /*break*/, 4];
                                                    case 3:
                                                        e_3 = _a.sent();
                                                        console.log((0, colorette_1.red)("Failed to push pair"));
                                                        console.log(e_3);
                                                        console.log(pair);
                                                        return [3 /*break*/, 4];
                                                    case 4:
                                                        resolve(null);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }));
                                    };
                                    for (_i = 0, maybePairs_1 = maybePairs; _i < maybePairs_1.length; _i++) {
                                        pair = maybePairs_1[_i];
                                        _loop_3(pair);
                                    }
                                    return [4 /*yield*/, Promise.all(pairsIterations)];
                                case 7:
                                    _b.sent();
                                    console.log("Formatted pairs for this blockchain : " + formattedPairs_1.length);
                                    crossChainFormattedPairs.push(formattedPairs_1);
                                    return [3 /*break*/, 9];
                                case 8:
                                    crossChainFormattedPairs.push([]);
                                    _b.label = 9;
                                case 9: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < contracts.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_2(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, crossChainFormattedPairs];
            }
        });
    });
}
function getMarketData(proxies, contracts, blockchains, pairs, circulatingSupply) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var blocks_history, recent_blocks_history, blockMap, eth_history, priceMap, liquidity_per_blockchain, price_per_blockchain, volume_per_blockchain, total_volume_per_blockchain, liquidity_history, market_cap_history, price_history, volume_history, total_volume_history, _loop_4, i, earliest, earliestTimestamp, i, i, liquidity, averagePrice, volume, total_volume, _i, blockchains_1, blockchain;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log(proxies.length, "proxies loaded.");
                    console.log("Loading market data...");
                    return [4 /*yield*/, supabase
                            .from("blocks_history")
                            .select("*")];
                case 1:
                    blocks_history = (_e.sent()).data;
                    return [4 /*yield*/, supabase
                            .from("blocks")
                            .select("*")];
                case 2:
                    recent_blocks_history = (_e.sent()).data;
                    blockMap = new Map(blocks_history.map(function (entry) {
                        var mergedBlocks = entry.blocks.blocks
                            .concat(recent_blocks_history[recent_blocks_history.map(function (e) { return e.name; }).indexOf(entry.name)].blocks.blocks)
                            .sort(function (a, b) {
                            return a[0] - b[0];
                        });
                        return [
                            entry.name,
                            {
                                blocks: mergedBlocks.filter(function (entry, index) {
                                    return mergedBlocks.map(function (e) { return e[1]; }).indexOf(entry[1]) == index;
                                })
                            },
                        ];
                    }));
                    return [4 /*yield*/, supabase
                            .from("eth_history")
                            .select("*")];
                case 3:
                    eth_history = (_e.sent()).data;
                    priceMap = new Map(eth_history.map(function (entry) {
                        return [entry.name, entry.price.concat(entry.recent_price)];
                    }));
                    liquidity_per_blockchain = new Map(blockchains.map(function (blockchain) {
                        return [blockchain, []];
                    }));
                    price_per_blockchain = new Map(blockchains.map(function (blockchain) {
                        return [blockchain, []];
                    }));
                    volume_per_blockchain = new Map(blockchains.map(function (blockchain) {
                        return [blockchain, []];
                    }));
                    total_volume_per_blockchain = new Map(blockchains.map(function (blockchain) {
                        return [blockchain, []];
                    }));
                    liquidity_history = [];
                    market_cap_history = [];
                    price_history = [];
                    volume_history = [];
                    total_volume_history = [];
                    _loop_4 = function (i) {
                        var blocks_1, tokenGenesis, pipeline_1, counter, latestPriceUSD, latestHistoryBlock_1, lastEntry_1, pairsMap_1, toNumber_1;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    if (!RPCLimits[blockchains[i]]) return [3 /*break*/, 5];
                                    blocks_1 = blockMap.get(blockchains[i]).blocks;
                                    tokenGenesis = Math.min.apply(Math, pairs[i].map(function (pair) { return pair.createdAt; }));
                                    console.log(pairs, {
                                        topics: [[swapEvent, syncEvent]],
                                        address: pairs[i].map(function (pair) { return pair.address; }),
                                        blockchain: blockchains[i],
                                        genesis: tokenGenesis,
                                        proxies: proxies,
                                        name: contracts[i] + "-" + "market.json"
                                    });
                                    return [4 /*yield*/, shouldLoad(contracts[i] + "-" + "market.json")];
                                case 1:
                                    if (!_f.sent()) return [3 /*break*/, 3];
                                    console.log("Loading market data.");
                                    return [4 /*yield*/, loadOnChainData({
                                            topics: [[swapEvent, syncEvent]],
                                            address: pairs[i].map(function (pair) { return pair.address; }),
                                            blockchain: blockchains[i],
                                            genesis: tokenGenesis,
                                            proxies: proxies,
                                            name: contracts[i] + "-" + "market.json"
                                        })];
                                case 2:
                                    _f.sent();
                                    _f.label = 3;
                                case 3:
                                    pipeline_1 = (0, stream_chain_1.chain)([
                                        fs_1["default"].createReadStream("logs/" + contracts[i] + "-" + "market.json"),
                                        (0, stream_json_1.parser)(),
                                        (0, Pick_1.pick)({ filter: "data" }),
                                        (0, StreamArray_1.streamArray)(),
                                    ]);
                                    counter = 0;
                                    latestPriceUSD = 0;
                                    latestHistoryBlock_1 = {
                                        number: 0,
                                        index: 0,
                                        timestamp: 0
                                    };
                                    pairsMap_1 = new Map(pairs[i].map(function (pair) {
                                        return [pair.address, pair];
                                    }));
                                    toNumber_1 = function (amount, decimals) {
                                        // @ts-ignore
                                        return Number((amount * 10000n) / BigInt(Math.pow(10, decimals))) / 10000;
                                    };
                                    return [4 /*yield*/, new Promise(function (resolve) {
                                            var liquidity_history = liquidity_per_blockchain.get(blockchains[i]);
                                            var price_history = price_per_blockchain.get(blockchains[i]);
                                            var volume_history = volume_per_blockchain.get(blockchains[i]);
                                            var total_volume_history = total_volume_per_blockchain.get(blockchains[i]);
                                            pipeline_1.on("data", function (data) {
                                                var _a;
                                                var entry = data.value;
                                                if (entry && entry.address) {
                                                    lastEntry_1 = entry;
                                                    // console.log("=========================================");
                                                    // console.log(entry, entry.value);
                                                    var pair = pairsMap_1.get(entry.address.toLowerCase());
                                                    var clearData = entry.data.split("0x")[1];
                                                    if (pair) {
                                                        // console.log(
                                                        //   yellow(
                                                        //     "New entry detected at block " +
                                                        //       entry.blockNumber +
                                                        //       " on pair " +
                                                        //       pair.address +
                                                        //       " at TX " +
                                                        //       entry.transactionHash
                                                        //   )
                                                        // );
                                                        /**
                                                         * @TODO we look at the @blockNumber and see if it is bigger
                                                         * than the timestamp saved in @block_history - if it is, we
                                                         * iterate the timestamps of block_history and save in the
                                                         * @data_history for each timestamp, the current state of the reserves, by
                                                         * saving the @total_volume without retouching, recalculating the
                                                         * @liquidity_history according to the @ETH price that we get locally
                                                         * thanks to the already aggregated data
                                                         * then consequently the @price_history
                                                         */
                                                        /**
                                                         * We expect @daysPassed length to be most of the time equal to 1 when we jump
                                                         * on a new day, but if there has been no trades for +24 hours, we will jump
                                                         * two days, and we need to get a log for each day.
                                                         */
                                                        var daysPassed = [];
                                                        if (entry.blockNumber > latestHistoryBlock_1.number) {
                                                            console.log((0, colorette_1.magenta)("Need to push a new entry in history."));
                                                            for (var q = latestHistoryBlock_1.index; q < blocks_1.length; q++) {
                                                                console.log("Fetching new history block", blocks_1[q][1]);
                                                                if (blocks_1[q][1] > entry.blockNumber) {
                                                                    latestHistoryBlock_1.index = q;
                                                                    latestHistoryBlock_1.number = blocks_1[q][1];
                                                                    latestHistoryBlock_1.timestamp = blocks_1[q][0];
                                                                    break;
                                                                }
                                                                if (latestHistoryBlock_1.index != 0) {
                                                                    daysPassed.push(blocks_1[q]);
                                                                }
                                                            }
                                                            console.log("Iterating " + daysPassed.length + " days passed.");
                                                            // if (latestHistoryBlock.number > entry.blockNumber) {
                                                            for (var q = 0; q < daysPassed.length; q++) {
                                                                /**
                                                                 * @TODO v1.1 : update all the pairs reserve compared to ETH price.
                                                                 */
                                                                var averagePrice = 0;
                                                                var totalLiquidity = 0;
                                                                var totalUntrackedLiquidity = 0;
                                                                var totalVolume = 0;
                                                                for (var _i = 0, _b = pairs[i]; _i < _b.length; _i++) {
                                                                    var newPair = _b[_i];
                                                                    var freshPair = pairsMap_1.get(newPair.address);
                                                                    if (!isNaN(freshPair.pairData.reserveUSD) &&
                                                                        freshPair.pairData.reserveUSD > 500) {
                                                                        totalLiquidity += freshPair.pairData.reserveUSD;
                                                                        totalVolume += freshPair.pairData.volumeUSD;
                                                                        averagePrice +=
                                                                            freshPair.priceUSD * freshPair.pairData.reserveUSD;
                                                                        console.log("Considering pair ", freshPair.address);
                                                                        console.log(JSON.stringify(freshPair, function (key, value) {
                                                                            return typeof value === "bigint" ? value.toString() : value;
                                                                        } // return everything else unchanged
                                                                        ));
                                                                    }
                                                                    else if (!isNaN(freshPair.numberReserve) &&
                                                                        freshPair.numberReserve) {
                                                                        totalUntrackedLiquidity += freshPair.numberReserve;
                                                                        totalVolume += freshPair.pairData.volumeUSD;
                                                                    }
                                                                }
                                                                console.log(JSON.stringify({
                                                                    liquidity: totalLiquidity,
                                                                    price: averagePrice,
                                                                    totalVolume: totalVolume
                                                                }));
                                                                if (averagePrice && totalLiquidity)
                                                                    averagePrice /= totalLiquidity;
                                                                var finalLiquidity = (totalUntrackedLiquidity || 0) * (averagePrice || 0) +
                                                                    totalLiquidity;
                                                                console.log((0, colorette_1.green)("Pushing new entry " +
                                                                    daysPassed[q][0] +
                                                                    ":" +
                                                                    daysPassed[q][1]));
                                                                console.log(JSON.stringify({
                                                                    liquidity: finalLiquidity,
                                                                    price: averagePrice,
                                                                    totalVolume: totalVolume
                                                                }));
                                                                var last24hTotalVolume = 0;
                                                                var lastDistance = Infinity;
                                                                for (var o = total_volume_history.length - 1; o >= 0; o--) {
                                                                    if (Math.abs(daysPassed[q][0] -
                                                                        (total_volume_history[o][0] + 24 * 60 * 60 * 1000)) < lastDistance) {
                                                                        lastDistance = Math.abs(daysPassed[q][0] -
                                                                            (total_volume_history[o][0] + 24 * 60 * 60 * 1000));
                                                                        last24hTotalVolume = total_volume_history[o][1];
                                                                    }
                                                                    if (Math.abs(daysPassed[q][0] -
                                                                        (total_volume_history[o][0] + 24 * 60 * 60 * 1000)) >
                                                                        48 * 60 * 60 * 1000)
                                                                        break;
                                                                }
                                                                liquidity_history.push([daysPassed[q][0], finalLiquidity]);
                                                                price_history.push([daysPassed[q][0], averagePrice]);
                                                                volume_history.push([
                                                                    daysPassed[q][0],
                                                                    totalVolume - last24hTotalVolume,
                                                                ]);
                                                                total_volume_history.push([daysPassed[q][0], totalVolume]);
                                                                // liquidity_per_blockchain.set(
                                                                //   blockchains[i],
                                                                //   liquidity_history
                                                                // );
                                                                // price_per_blockchain.set(blockchains[i], price_history);
                                                                // volume_per_blockchain.set(blockchains[i], volume_history);
                                                                // total_volume_per_blockchain.set(
                                                                //   blockchains[i],
                                                                //   total_volume_history
                                                                // );
                                                                // if (price_history.length > 20) process.exit();
                                                            }
                                                            // }
                                                        }
                                                        else {
                                                            // console.log(
                                                            //   "Now vs History : ",
                                                            //   entry.blockNumber,
                                                            //   latestHistoryBlock.number
                                                            // );
                                                        }
                                                        // console.log("Start liquidity ", pair.pairData.reserveUSD);
                                                        if (entry.topics[0] == swapEvent) {
                                                            // console.log(green("Swap event detected. Processing."));
                                                            var amount0In = BigInt("0x" + clearData.slice(0, 64));
                                                            var amount1In = BigInt("0x" + clearData.slice(64, 128));
                                                            var amount0Out = BigInt("0x" + clearData.slice(128, 192));
                                                            var amount1Out = BigInt("0x" + clearData.slice(192, 256));
                                                            var tokenIn = 
                                                            // @ts-ignore
                                                            amount0In === 0n
                                                                ? "token1"
                                                                : // @ts-ignore
                                                                    amount0Out === 0n
                                                                        ? "token0"
                                                                        : "token1";
                                                            var tokenOut = tokenIn == "token1" ? "token0" : "token1";
                                                            // console.log(
                                                            //   JSON.stringify(
                                                            //     { amount0In, amount1In, amount0Out, amount1Out },
                                                            //     (key, value) =>
                                                            //       typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                                                            //   )
                                                            // );
                                                            var studiedToken = pair[tokenIn].type != "other"
                                                                ? __assign(__assign({}, pair[tokenIn]), { "in": true, token: tokenIn }) : pair[tokenOut].type != "other"
                                                                ? __assign(__assign({}, pair[tokenOut]), { "in": true, token: tokenOut }) : pair[tokenIn].address == contracts[i].toLowerCase()
                                                                ? __assign(__assign({}, pair[tokenIn]), { "in": true, token: tokenIn }) : __assign(__assign({}, pair[tokenOut]), { "in": false, token: tokenOut });
                                                            var amount = studiedToken["in"]
                                                                ? studiedToken.token == "token0"
                                                                    ? amount0In
                                                                    : amount1In
                                                                : studiedToken.token == "token0"
                                                                    ? amount0Out
                                                                    : amount1Out;
                                                            var amountUSD = void 0;
                                                            switch (studiedToken.type) {
                                                                case "eth":
                                                                    amountUSD =
                                                                        toNumber_1(amount, studiedToken.decimals) *
                                                                            getEthPrice(entry.blockNumber, priceMap.get(blockchains[i]));
                                                                    break;
                                                                case "stable":
                                                                    amountUSD = toNumber_1(amount, studiedToken.decimals);
                                                                    break;
                                                                case "other":
                                                                    amountUSD =
                                                                        toNumber_1(amount, studiedToken.decimals) *
                                                                            ((_a = price_history[price_history.length - 1]) === null || _a === void 0 ? void 0 : _a[1]) || 0;
                                                                    break;
                                                            }
                                                            var bufferPair = pair.pairData.volumeUSD;
                                                            pair.pairData.volumeUSD += amountUSD;
                                                            pairsMap_1.set(pair.address, pair);
                                                        }
                                                        else {
                                                            // console.log(green("Sync event detected. Processing."));
                                                            var reserve0 = BigInt("0x" + clearData.slice(0, 64));
                                                            var reserve1 = BigInt("0x" + clearData.slice(64, 128));
                                                            pair.pairData.reserve0 = reserve0;
                                                            pair.pairData.reserve1 = reserve1;
                                                            // console.log(
                                                            //   JSON.stringify(
                                                            //     { reserve0, reserve1 },
                                                            //     (key, value) =>
                                                            //       typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                                                            //   )
                                                            // );
                                                            var tokenNumber = pair.token0.address == contracts[i].toLowerCase() ? "0" : "1";
                                                            var otherNumber = tokenNumber == "0" ? "1" : "0";
                                                            var token = ("token" + tokenNumber);
                                                            var other = ("token" + otherNumber);
                                                            var tokenReserve = ("reserve" + tokenNumber);
                                                            var otherReserve = ("reserve" + otherNumber);
                                                            var studiedToken = pair[token].type == "other"
                                                                ? pair[other].type == "other"
                                                                    ? __assign(__assign({}, pair[token]), { reserve: tokenReserve }) : __assign(__assign({}, pair[other]), { reserve: otherReserve })
                                                                : pair[token].type == "stable"
                                                                    ? __assign(__assign({}, pair[token]), { reserve: tokenReserve }) : pair[other].type == "stable"
                                                                    ? __assign(__assign({}, pair[other]), { reserve: otherReserve }) : /**
                                                                   * @PAINPOINT This one is a bit tricky, but basically if the tokenA is
                                                                   * ETH, then consider it as other if it's not VS stable.
                                                                   * Else we'll recursively query getEthPrice
                                                                   * while we don't have ethPrice at all.
                                                                   */ __assign(__assign({}, pair[token]), { reserve: tokenReserve, type: "other" });
                                                            var reserveUSD = 0;
                                                            switch (studiedToken.type) {
                                                                case "eth":
                                                                    reserveUSD =
                                                                        toNumber_1(pair.pairData[studiedToken.reserve], studiedToken.decimals) *
                                                                            getEthPrice(entry.blockNumber, priceMap.get(blockchains[i])) *
                                                                            2;
                                                                    // console.log("ETH is the studied token");
                                                                    // console.log(JSON.stringify({ reserveUSD }));
                                                                    // console.log(
                                                                    //   JSON.stringify({
                                                                    //     tokenReserve: toNumber(
                                                                    //       pair.pairData[studiedToken.reserve],
                                                                    //       studiedToken.decimals
                                                                    //     ),
                                                                    //   })
                                                                    // );
                                                                    // console.log(
                                                                    //   JSON.stringify({
                                                                    //     ethPrice: getEthPrice(
                                                                    //       entry.blockNumber,
                                                                    //       priceMap.get(blockchains[i])!
                                                                    //     ),
                                                                    //   })
                                                                    // );
                                                                    // console.log(JSON.stringify({ latestPriceUSD }));
                                                                    break;
                                                                case "stable":
                                                                    reserveUSD =
                                                                        toNumber_1(pair.pairData[studiedToken.reserve], studiedToken.decimals) * 2;
                                                                    // console.log("Stable is the studied token");
                                                                    // console.log(
                                                                    //   JSON.stringify({
                                                                    //     reserveUSD,
                                                                    //   })
                                                                    // );
                                                                    // console.log(
                                                                    //   JSON.stringify({
                                                                    //     tokenReserve: toNumber(
                                                                    //       pair.pairData[studiedToken.reserve],
                                                                    //       studiedToken.decimals
                                                                    //     ),
                                                                    //   })
                                                                    // );
                                                                    // console.log(JSON.stringify({ latestPriceUSD }));
                                                                    break;
                                                                case "other":
                                                                    // reserveUSD =
                                                                    //   toNumber(
                                                                    //     pair.pairData[studiedToken.reserve],
                                                                    //     studiedToken.decimals
                                                                    //   ) *
                                                                    //   latestPriceUSD *
                                                                    //   2;
                                                                    // console.log("Other is the studied token");
                                                                    // console.log(
                                                                    //   JSON.stringify({
                                                                    //     reserveUSD,
                                                                    //   })
                                                                    // );
                                                                    // console.log(
                                                                    //   JSON.stringify({
                                                                    //     tokenReserve: toNumber(
                                                                    //       pair.pairData[studiedToken.reserve],
                                                                    //       studiedToken.decimals
                                                                    //     ),
                                                                    //   })
                                                                    // );
                                                                    // console.log(JSON.stringify({ latestPriceUSD }));
                                                                    break;
                                                            }
                                                            var reserveToken = toNumber_1(pair.pairData[tokenReserve], pair[token].decimals);
                                                            var priceUSD = reserveToken && reserveUSD
                                                                ? reserveUSD / 2 / reserveToken
                                                                : 0;
                                                            // console.log(
                                                            //   JSON.stringify(
                                                            //     {
                                                            //       reserve0,
                                                            //       reserve1,
                                                            //       reserveUSD,
                                                            //       priceUSD,
                                                            //       tokenReserve,
                                                            //       numberReserve: toNumber(
                                                            //         pair.pairData[tokenReserve],
                                                            //         pair[token].decimals
                                                            //       ),
                                                            //     },
                                                            //     (key, value) =>
                                                            //       typeof value === "bigint" ? value.toString() : value // return everything else unchanged
                                                            //   )
                                                            // );
                                                            pair.pairData.reserveUSD = reserveUSD;
                                                            pair.priceUSD = priceUSD;
                                                            pair.numberReserve = toNumber_1(pair.pairData[tokenReserve], pair[token].decimals);
                                                            pairsMap_1.set(pair.address, pair);
                                                            // console.log(
                                                            //   JSON.stringify({
                                                            //     reserve: pair.pairData.reserveUSD,
                                                            //     priceUSD,
                                                            //   })
                                                            // );
                                                            var totalLiquidity = 0;
                                                            var averagePrice = 0;
                                                            for (var _c = 0, _d = pairs[i]; _c < _d.length; _c++) {
                                                                var newPair = _d[_c];
                                                                var freshPair = pairsMap_1.get(newPair.address);
                                                                totalLiquidity += freshPair.pairData.reserveUSD;
                                                                averagePrice +=
                                                                    freshPair.priceUSD * freshPair.pairData.reserveUSD;
                                                            }
                                                            // if (averagePrice && totalLiquidity)
                                                            //   averagePrice /= totalLiquidity;
                                                            // latestPriceUSD = averagePrice;
                                                        }
                                                        // console.log("New latestPriceUSD", latestPriceUSD);
                                                        // console.log("Final liquidity ", pair.pairData.reserveUSD);
                                                    }
                                                    else {
                                                        console.log((0, colorette_1.red)("New entry with no pair associated " + entry.address));
                                                    }
                                                }
                                            });
                                            pipeline_1.on("end", function () {
                                                var daysPassed = [];
                                                console.log((0, colorette_1.magenta)("Need to push a new lastEntry in history. (end)"));
                                                for (var q = latestHistoryBlock_1.index; q < blocks_1.length; q++) {
                                                    console.log("Fetching new history block", blocks_1[q][1]);
                                                    if (latestHistoryBlock_1.index != 0) {
                                                        daysPassed.push(blocks_1[q]);
                                                    }
                                                }
                                                console.log("Iterating " + daysPassed.length + " days passed.");
                                                for (var q = 0; q < daysPassed.length; q++) {
                                                    // const liquidity_history = liquidity_per_blockchain.get(
                                                    //   blockchains[i]
                                                    // )!;
                                                    // const price_history = price_per_blockchain.get(blockchains[i])!;
                                                    // const volume_history = volume_per_blockchain.get(blockchains[i])!;
                                                    // const total_volume_history = total_volume_per_blockchain.get(
                                                    //   blockchains[i]
                                                    // )!;
                                                    /**
                                                     * @TODO v1.1 : update all the pairs reserve compared to ETH price.
                                                     */
                                                    var averagePrice = 0;
                                                    var totalLiquidity = 0;
                                                    var totalUntrackedLiquidity = 0;
                                                    var totalVolume = 0;
                                                    for (var _i = 0, _a = pairs[i]; _i < _a.length; _i++) {
                                                        var newPair = _a[_i];
                                                        var freshPair = pairsMap_1.get(newPair.address);
                                                        if (!isNaN(freshPair.pairData.reserveUSD) &&
                                                            freshPair.pairData.reserveUSD > 500) {
                                                            totalLiquidity += freshPair.pairData.reserveUSD;
                                                            totalVolume += freshPair.pairData.volumeUSD;
                                                            averagePrice +=
                                                                freshPair.priceUSD * freshPair.pairData.reserveUSD;
                                                            console.log("Considering pair ", freshPair.address);
                                                            console.log(freshPair);
                                                        }
                                                        else if (!isNaN(freshPair.numberReserve) &&
                                                            freshPair.numberReserve) {
                                                            totalUntrackedLiquidity += freshPair.numberReserve;
                                                            totalVolume += freshPair.pairData.volumeUSD;
                                                        }
                                                    }
                                                    console.log({
                                                        liquidity: totalLiquidity,
                                                        price: averagePrice,
                                                        totalVolume: totalVolume
                                                    });
                                                    if (averagePrice && totalLiquidity)
                                                        averagePrice /= totalLiquidity;
                                                    var finalLiquidity = (totalUntrackedLiquidity || 0) * (averagePrice || 0) +
                                                        totalLiquidity;
                                                    console.log((0, colorette_1.green)("Pushing new entry " + daysPassed[q][0] + ":" + daysPassed[q][1]));
                                                    console.log({
                                                        liquidity: finalLiquidity,
                                                        price: averagePrice,
                                                        totalVolume: totalVolume
                                                    });
                                                    var last24hTotalVolume = 0;
                                                    var lastDistance = Infinity;
                                                    for (var o = total_volume_history.length - 1; o >= 0; o--) {
                                                        if (Math.abs(daysPassed[q][0] -
                                                            (total_volume_history[o][0] + 24 * 60 * 60 * 1000)) < lastDistance) {
                                                            lastDistance = Math.abs(daysPassed[q][0] -
                                                                (total_volume_history[o][0] + 24 * 60 * 60 * 1000));
                                                            last24hTotalVolume = total_volume_history[o][1];
                                                        }
                                                        if (Math.abs(daysPassed[q][0] -
                                                            (total_volume_history[o][0] + 24 * 60 * 60 * 1000)) >
                                                            48 * 60 * 60 * 1000)
                                                            break;
                                                    }
                                                    liquidity_history.push([daysPassed[q][0], finalLiquidity]);
                                                    price_history.push([daysPassed[q][0], averagePrice]);
                                                    volume_history.push([
                                                        daysPassed[q][0],
                                                        totalVolume - last24hTotalVolume,
                                                    ]);
                                                    total_volume_history.push([daysPassed[q][0], totalVolume]);
                                                    liquidity_per_blockchain.set(blockchains[i], liquidity_history);
                                                    price_per_blockchain.set(blockchains[i], price_history);
                                                    volume_per_blockchain.set(blockchains[i], volume_history);
                                                    total_volume_per_blockchain.set(blockchains[i], total_volume_history);
                                                }
                                                for (var n = 0; n < liquidity_per_blockchain.get(blockchains[i]).length; n += 100) {
                                                    console.log(liquidity_per_blockchain.get(blockchains[i]).slice(n, n + 100));
                                                }
                                                for (var n = 0; n < liquidity_per_blockchain.get(blockchains[i]).length; n += 100) {
                                                    console.log(volume_per_blockchain.get(blockchains[i]).slice(n, n + 100));
                                                }
                                                for (var n = 0; n < liquidity_per_blockchain.get(blockchains[i]).length; n += 100) {
                                                    console.log(price_per_blockchain.get(blockchains[i]).slice(n, n + 100));
                                                }
                                                console.log("Resolving");
                                                resolve(null);
                                            });
                                        })];
                                case 4:
                                    _f.sent();
                                    _f.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _e.label = 4;
                case 4:
                    if (!(i < contracts.length)) return [3 /*break*/, 7];
                    return [5 /*yield**/, _loop_4(i)];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 4];
                case 7:
                    earliest = blockchains[0];
                    earliestTimestamp = Infinity;
                    for (i = 0; i < blockchains.length; i++) {
                        if (earliestTimestamp >
                            (((_b = (_a = liquidity_per_blockchain.get(blockchains[i])) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b[0]) || Date.now())) {
                            earliestTimestamp =
                                ((_d = (_c = liquidity_per_blockchain.get(blockchains[i])) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d[0]) || Date.now();
                            earliest = blockchains[i];
                        }
                    }
                    for (i = 0; i < liquidity_per_blockchain.get(earliest).length; i++) {
                        liquidity = liquidity_per_blockchain.get(earliest)[i][1];
                        averagePrice = price_per_blockchain.get(earliest)[i][1] * liquidity;
                        volume = volume_per_blockchain.get(earliest)[i][1];
                        total_volume = total_volume_per_blockchain.get(earliest)[i][1];
                        console.log("Starting with ", price_per_blockchain.get(earliest)[i][1], liquidity);
                        for (_i = 0, blockchains_1 = blockchains; _i < blockchains_1.length; _i++) {
                            blockchain = blockchains_1[_i];
                            if (blockchain != earliest &&
                                liquidity_per_blockchain.get(blockchain)[i]) {
                                liquidity += liquidity_per_blockchain.get(blockchain)[i][1];
                                averagePrice +=
                                    price_per_blockchain.get(blockchain)[i][1] *
                                        liquidity_per_blockchain.get(blockchain)[i][1];
                                console.log("Incrementing with ", price_per_blockchain.get(blockchain)[i][1], liquidity_per_blockchain.get(blockchain)[i][1]);
                                volume += volume_per_blockchain.get(blockchain)[i][1];
                            }
                        }
                        console.log("Pushing", averagePrice / liquidity);
                        liquidity_history.push([
                            liquidity_per_blockchain.get(earliest)[i][0],
                            liquidity,
                        ]);
                        price_history.push([
                            liquidity_per_blockchain.get(earliest)[i][0],
                            averagePrice / liquidity,
                        ]);
                        market_cap_history.push([
                            liquidity_per_blockchain.get(earliest)[i][0],
                            (averagePrice / liquidity) * circulatingSupply,
                        ]);
                        volume_history.push([
                            liquidity_per_blockchain.get(earliest)[i][0],
                            volume,
                        ]);
                        total_volume_history.push([
                            liquidity_per_blockchain.get(earliest)[i][0],
                            total_volume,
                        ]);
                    }
                    return [2 /*return*/, {
                            liquidity_history: liquidity_history,
                            market_cap_history: market_cap_history,
                            price_history: price_history,
                            volume_history: volume_history,
                            total_volume_history: total_volume_history
                        }];
            }
        });
    });
}
function loadOnChainData(_a) {
    var address = _a.address, topics = _a.topics, genesis = _a.genesis, proxies = _a.proxies, blockchain = _a.blockchain, name = _a.name;
    return __awaiter(this, void 0, void 0, function () {
        var magicWeb3, normalWeb3, latestBlock, iterationsNeeded, _loop_5, k;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Genesis : " + genesis);
                    if (restartSettings.block && restartSettings.block > genesis) {
                        genesis = restartSettings.block;
                        console.log("Updated genesis = " + genesis);
                    }
                    magicWeb3 = new MagicWeb3_1.MagicWeb3(supportedRPCs[blockchain], proxies);
                    normalWeb3 = new web3_1["default"](new web3_1["default"].providers.HttpProvider(supportedRPCs[blockchain][0]));
                    return [4 /*yield*/, getForSure(normalWeb3.eth.getBlock("latest"))];
                case 1:
                    latestBlock = _b.sent();
                    iterationsNeeded = (latestBlock.number - genesis) /
                        RPCLimits[blockchain].maxRange /
                        RPCLimits[blockchain].queriesLimit /
                        (proxies.length * Math.min(supportedRPCs[blockchain].length, 2));
                    if (!restartSettings.restart || !fs_1["default"].existsSync("logs/" + name)) {
                        openDataFile(name);
                    }
                    else {
                        console.log("Not opening data file as already starting.");
                    }
                    console.log("Total operations needed:" + iterationsNeeded);
                    _loop_5 = function (k) {
                        var calls, data, needToRecall, _loop_6, j, success, ok, _c, _d, bufferRange, iterations, failedIterations, sliced, _loop_7, separator, entries;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    console.log((0, colorette_1.yellow)("=========================="));
                                    calls = [];
                                    data = [];
                                    printMemoryUsage();
                                    needToRecall = [];
                                    console.log((0, colorette_1.green)("Starting a new batch  at block " +
                                        Math.floor(k) +
                                        " on " +
                                        blockchain +
                                        " (scraping " +
                                        (latestBlock.number - genesis) / iterationsNeeded +
                                        " blocks"));
                                    _loop_6 = function (j) {
                                        calls.push(new Promise(function (resolve) {
                                            var pushed = false;
                                            var id = setTimeout(function () {
                                                if (!pushed) {
                                                    pushed = true;
                                                    needToRecall.push({
                                                        fromBlock: j,
                                                        toBlock: j + RPCLimits[blockchain].maxRange,
                                                        type: "pair"
                                                    });
                                                }
                                                resolve();
                                            }, RPCLimits[blockchain].timeout);
                                            magicWeb3
                                                .eth()
                                                .getPastLogs({
                                                fromBlock: Math.floor(j),
                                                toBlock: Math.floor(j + RPCLimits[blockchain].maxRange),
                                                address: address,
                                                topics: topics
                                            })["catch"](function (e) {
                                                if (!pushed) {
                                                    pushed = true;
                                                    needToRecall.push({
                                                        fromBlock: j,
                                                        toBlock: j + RPCLimits[blockchain].maxRange,
                                                        type: "pair"
                                                    });
                                                }
                                            })
                                                .then(function (reply) {
                                                clearTimeout(id);
                                                resolve(reply);
                                            });
                                        }));
                                    };
                                    for (j = k; j < k + (latestBlock.number - genesis) / iterationsNeeded; j += RPCLimits[blockchain].maxRange) {
                                        _loop_6(j);
                                    }
                                    console.log((0, colorette_1.yellow)("Fetching data..."));
                                    success = 0;
                                    ok = 0;
                                    console.log("Loading data from " + calls.length + " calls");
                                    _d = (_c = data).concat;
                                    return [4 /*yield*/, Promise.all(calls)];
                                case 1:
                                    data = _d.apply(_c, [(_e.sent()).map(function (entry, index) {
                                            // @ts-ignore
                                            if (((entry === null || entry === void 0 ? void 0 : entry.length) || 0) > 0) {
                                                success++;
                                                return entry;
                                            }
                                            else {
                                                if (entry)
                                                    ok++;
                                                return (k +
                                                    index * RPCLimits[blockchain].maxRange +
                                                    " (" +
                                                    (entry ? "OK" : "ERROR") +
                                                    ")");
                                            }
                                        })]);
                                    console.log(Date.now());
                                    console.log((0, colorette_1.green)(success +
                                        " successful events found on this iteration (" +
                                        ok +
                                        " replied calls)"));
                                    bufferRange = RPCLimits[blockchain].maxRange;
                                    iterations = 1;
                                    failedIterations = 0;
                                    sliced = 0;
                                    _loop_7 = function () {
                                        var recalls, blocRange, changingRange, tempNeedToRecall, _loop_8, p, broken, success_1, timeout, empty, forbidden, RPCResult, formattedEvents, l, reply;
                                        return __generator(this, function (_f) {
                                            switch (_f.label) {
                                                case 0:
                                                    // idée : au départ, diviseur maximum qu'on peut supporter.
                                                    // Ensuite, on itère avec ce diviseur jusqu'à ce que le nouveau diviseur
                                                    // soit 2x plus petit et là on subdivise les blocs
                                                    console.log((0, colorette_1.yellow)("---------------------------------------------------"));
                                                    recalls = [];
                                                    blocRange = Math.floor(RPCLimits[blockchain].maxRange /
                                                        2 /
                                                        Math.ceil((proxies.length *
                                                            supportedRPCs[blockchain].length *
                                                            RPCLimits[blockchain].queriesLimit) /
                                                            needToRecall.length));
                                                    changingRange = bufferRange / 2 >= blocRange;
                                                    bufferRange = changingRange ? Math.floor(bufferRange / 2) : bufferRange;
                                                    bufferRange = bufferRange === 0 ? 1 : bufferRange;
                                                    console.log("Waiting 30 sec...");
                                                    return [4 /*yield*/, delay(60000)];
                                                case 1:
                                                    _f.sent();
                                                    console.log(changingRange ? "UPDATING Range" : "Not modifying range");
                                                    console.log("Current block range : " + bufferRange);
                                                    if (sliced === 1) {
                                                        needToRecall = needToRecall.slice(0, Math.ceil(needToRecall.length / 2));
                                                    }
                                                    else if (sliced === 2) {
                                                        needToRecall = needToRecall.slice(Math.floor(needToRecall.length / 2), needToRecall.length);
                                                    }
                                                    console.log((0, colorette_1.yellow)("Recalling failed calls (" +
                                                        needToRecall.length * (changingRange ? 2 : 1) +
                                                        ") => " +
                                                        needToRecall.length * (changingRange ? 2 : 1) * bufferRange +
                                                        " blocks."));
                                                    tempNeedToRecall = [];
                                                    _loop_8 = function (p) {
                                                        var _loop_9 = function (x) {
                                                            if (x + bufferRange < latestBlock.number) {
                                                                recalls.push(new Promise(function (resolve) {
                                                                    var pushed = false;
                                                                    var id = setTimeout(function () {
                                                                        if (!pushed) {
                                                                            pushed = true;
                                                                            tempNeedToRecall.push({
                                                                                type: needToRecall[p].type,
                                                                                fromBlock: x,
                                                                                toBlock: x + bufferRange
                                                                            });
                                                                        }
                                                                        resolve("Timeout");
                                                                    }, RPCLimits[blockchain].timeout + iterations * RPCLimits[blockchain].timeoutPlus);
                                                                    magicWeb3
                                                                        .eth()
                                                                        .getPastLogs({
                                                                        fromBlock: Math.floor(x),
                                                                        toBlock: Math.floor(x + bufferRange),
                                                                        address: address,
                                                                        topics: topics
                                                                    })["catch"](function (e) {
                                                                        if (!pushed) {
                                                                            pushed = true;
                                                                            tempNeedToRecall.push({
                                                                                type: needToRecall[p].type,
                                                                                fromBlock: x,
                                                                                toBlock: x + bufferRange
                                                                            });
                                                                            if (e.toString() ==
                                                                                'Error: Invalid JSON RPC response: ""' ||
                                                                                e.toString() ==
                                                                                    'Error: Invalid JSON RPC response: {"size":0,"timeout":0}') {
                                                                                resolve("Empty");
                                                                            }
                                                                            else if (e.toString().includes("Forbidden") ||
                                                                                e.toString().includes("CONNECTION ERROR") ||
                                                                                e.toString().includes("limit")) {
                                                                                resolve("Forbidden");
                                                                            }
                                                                            else if (e.toString().includes("CONNECTION TIMEOUT")) {
                                                                                resolve("Timeout");
                                                                            }
                                                                            else {
                                                                                console.log(e.toString());
                                                                            }
                                                                        }
                                                                    })
                                                                        .then(function (reply) {
                                                                        clearTimeout(id);
                                                                        resolve(reply);
                                                                    });
                                                                }));
                                                            }
                                                        };
                                                        for (var x = needToRecall[p].fromBlock; x < needToRecall[p].toBlock; x += bufferRange) {
                                                            _loop_9(x);
                                                        }
                                                    };
                                                    for (p = 0; p < needToRecall.length; p++) {
                                                        _loop_8(p);
                                                    }
                                                    console.log((0, colorette_1.green)("Created ".concat(recalls.length, " calls.")));
                                                    broken = 0;
                                                    success_1 = 0;
                                                    timeout = 0;
                                                    empty = 0;
                                                    forbidden = 0;
                                                    return [4 /*yield*/, Promise.all(recalls)];
                                                case 2:
                                                    RPCResult = (_f.sent()).map(function (entry, index) {
                                                        // @ts-ignore
                                                        if (typeof entry != "string" && ((entry === null || entry === void 0 ? void 0 : entry.length) || 0) > 0) {
                                                            return entry;
                                                        }
                                                        else {
                                                            switch (entry) {
                                                                case "Timeout":
                                                                    timeout++;
                                                                    break;
                                                                case "Empty":
                                                                    empty++;
                                                                    break;
                                                                case "Forbidden":
                                                                    forbidden++;
                                                                    break;
                                                                default:
                                                                    broken++;
                                                                    break;
                                                            }
                                                            return " (" + (typeof entry == "object" ? "OK" : "ERROR") + ")";
                                                        }
                                                    });
                                                    formattedEvents = [];
                                                    for (l = 0; l < RPCResult.length; l += 1) {
                                                        reply = null;
                                                        if (RPCResult[l] &&
                                                            (typeof RPCResult[l] != "string" ||
                                                                RPCResult[l].includes("OK"))) {
                                                            reply = RPCResult[l];
                                                            success_1++;
                                                        }
                                                        if (reply && typeof reply != "string") {
                                                            formattedEvents.push(reply);
                                                        }
                                                    }
                                                    needToRecall = tempNeedToRecall;
                                                    console.log("Succesfully loaded " +
                                                        formattedEvents.length +
                                                        " events. Success: " +
                                                        success_1);
                                                    console.log("Need to recall : " +
                                                        needToRecall.length +
                                                        " left. Timeouts : " +
                                                        timeout +
                                                        ". Forbidden : " +
                                                        forbidden +
                                                        ". Empty : " +
                                                        empty +
                                                        ". Others : " +
                                                        broken);
                                                    if (success_1 === 0)
                                                        failedIterations++;
                                                    if (!(failedIterations === 10)) return [3 /*break*/, 4];
                                                    console.log("Looks like we are stuck... waiting 10 minutes.");
                                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000 * 60 * 10); })];
                                                case 3:
                                                    _f.sent();
                                                    console.log("Setting sliced mode.");
                                                    sliced = 1;
                                                    _f.label = 4;
                                                case 4:
                                                    if (sliced === 1) {
                                                        sliced = 2;
                                                    }
                                                    else if (sliced === 2) {
                                                        sliced = 0;
                                                    }
                                                    data = data.concat(formattedEvents);
                                                    iterations++;
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _e.label = 2;
                                case 2:
                                    if (!(needToRecall.length > 0)) return [3 /*break*/, 4];
                                    return [5 /*yield**/, _loop_7()];
                                case 3:
                                    _e.sent();
                                    return [3 /*break*/, 2];
                                case 4:
                                    separator = k + (latestBlock.number - genesis) / iterationsNeeded >=
                                        latestBlock.number;
                                    console.log("Separator");
                                    console.log(k + (latestBlock.number - genesis) / iterationsNeeded, latestBlock.number);
                                    entries = [];
                                    // console.log(data);
                                    data.forEach(function (entry) {
                                        if (entry && entry.length > 0 && typeof entry != "string")
                                            entries = entries.concat(entry);
                                    });
                                    // console.log(entries);
                                    entries = entries.sort(function (a, b) { return a.blockNumber - b.blockNumber; });
                                    return [4 /*yield*/, pushData(entries, name, separator)];
                                case 5:
                                    _e.sent();
                                    printMemoryUsage();
                                    // await new Promise((resolve, reject) => setTimeout(resolve, 3000))
                                    console.log("==========================");
                                    return [2 /*return*/];
                            }
                        });
                    };
                    k = genesis;
                    _b.label = 2;
                case 2:
                    if (!(k < latestBlock.number)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_5(k)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    k += (latestBlock.number - genesis) / iterationsNeeded;
                    return [3 /*break*/, 2];
                case 5:
                    closeDataFile(name);
                    return [2 /*return*/];
            }
        });
    });
}
function getEthPrice(blockNumber, price_history) {
    var maxDist = Infinity;
    var bestPrice = 0;
    for (var i = 0; i < price_history.length; i++) {
        if (Math.abs(price_history[i][0] - blockNumber) < maxDist) {
            maxDist = Math.abs(price_history[i][0] - blockNumber);
            bestPrice = price_history[i][1];
        }
    }
    return bestPrice;
}
function openDataFile(filename) {
    console.log("Writing new file.");
    console.log(fs_1["default"].writeFileSync("logs/" + filename, '{"data":['));
}
function closeDataFile(filename) {
    console.log("Closing new file");
    console.log(fs_1["default"].appendFileSync("logs/" + filename, "]}"));
}
function pushData(logs, filename, last) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_10, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Pushing", filename, last);
                    if (logs.length == 0) {
                        fs_1["default"].appendFileSync("logs/" + filename, "[]" + (last ? "" : ","));
                        return [2 /*return*/];
                    }
                    _loop_10 = function (i) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: 
                                // console.log(
                                //   "adding ",
                                //   JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ",")
                                // );
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        return fs_1["default"].appendFile("logs/" + filename, JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ","), function () { return resolve(null); });
                                    })];
                                case 1:
                                    // console.log(
                                    //   "adding ",
                                    //   JSON.stringify(logs[i]) + (i == logs.length - 1 && last ? "" : ",")
                                    // );
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < logs.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_10(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("Pushing " + logs.length + " events.");
                    return [2 /*return*/];
            }
        });
    });
}
function printMemoryUsage() {
    var memoryData = process.memoryUsage();
    var formatMemoryUsage = function (data) {
        return "".concat(Math.round((data / 1024 / 1024) * 100) / 100, " MB");
    };
    var memoryUsage = {
        rss: "".concat(formatMemoryUsage(memoryData.rss), " -> Resident Set Size - total memory allocated for the process execution"),
        heapTotal: "".concat(formatMemoryUsage(memoryData.heapTotal), " -> total size of the allocated heap"),
        heapUsed: "".concat(formatMemoryUsage(memoryData.heapUsed), " -> actual memory used during the execution"),
        external: "".concat(formatMemoryUsage(memoryData.external), " -> V8 external memory")
    };
    console.log(memoryUsage);
}
function getCirculatingSupply(total_supply_contracts, circulating_supply_addresses, contracts, blockchains) {
    return __awaiter(this, void 0, void 0, function () {
        var total_supply, _i, total_supply_contracts_1, contract, blockchain, tokenDecimals_1, _a, _b, e_4, circulating_supply, tokenDecimals, _c, circulating_supply_addresses_1, address, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    total_supply = BigInt(0);
                    _i = 0, total_supply_contracts_1 = total_supply_contracts;
                    _f.label = 1;
                case 1:
                    if (!(_i < total_supply_contracts_1.length)) return [3 /*break*/, 10];
                    contract = total_supply_contracts_1[_i];
                    blockchain = blockchains[contracts.indexOf(contract)];
                    if (!crypto_1.providers[blockchain]) return [3 /*break*/, 9];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, new ethers_1.ethers.Contract(contract, ["function decimals() external view returns (uint256)"], crypto_1.providers[blockchain]).decimals()];
                case 3:
                    tokenDecimals_1 = _f.sent();
                    if (!(tokenDecimals_1.toNumber() > 0)) return [3 /*break*/, 5];
                    _a = total_supply;
                    return [4 /*yield*/, new ethers_1.ethers.Contract(contract, ["function totalSupply() external view returns (uint256)"], crypto_1.providers[blockchain]).totalSupply()];
                case 4:
                    total_supply = _a + (_f.sent())
                        .div(ethers_1.ethers.utils.parseUnits("10", tokenDecimals_1.toNumber() - 1))
                        .toBigInt();
                    return [3 /*break*/, 7];
                case 5:
                    _b = total_supply;
                    return [4 /*yield*/, new ethers_1.ethers.Contract(contract, ["function totalSupply() external view returns (uint256)"], crypto_1.providers[blockchain]).totalSupply()];
                case 6:
                    total_supply = _b + (_f.sent()).toBigInt();
                    _f.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    e_4 = _f.sent();
                    console.log(e_4);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10:
                    circulating_supply = total_supply;
                    circulating_supply_addresses =
                        circulating_supply_addresses.concat(crypto_1.DEAD_WALLETS);
                    if (!crypto_1.providers[blockchains[0]]) return [3 /*break*/, 12];
                    return [4 /*yield*/, new ethers_1.ethers.Contract(contracts[0], ["function decimals() external view returns (uint256)"], crypto_1.providers[blockchains[0]]).decimals()];
                case 11:
                    tokenDecimals = _f.sent();
                    _f.label = 12;
                case 12:
                    _c = 0, circulating_supply_addresses_1 = circulating_supply_addresses;
                    _f.label = 13;
                case 13:
                    if (!(_c < circulating_supply_addresses_1.length)) return [3 /*break*/, 18];
                    address = circulating_supply_addresses_1[_c];
                    if (!crypto_1.providers[blockchains[0]]) return [3 /*break*/, 17];
                    if (!(tokenDecimals.toNumber() > 0)) return [3 /*break*/, 15];
                    _d = circulating_supply;
                    return [4 /*yield*/, new ethers_1.ethers.Contract(contracts[0], [
                            "function balanceOf(address account) external view returns (uint256)",
                        ], crypto_1.providers[blockchains[0]]).balanceOf(address)];
                case 14:
                    circulating_supply = _d - (_f.sent())
                        .div(ethers_1.ethers.utils.parseUnits("10", tokenDecimals.toNumber() - 1))
                        .toBigInt();
                    return [3 /*break*/, 17];
                case 15:
                    _e = circulating_supply;
                    return [4 /*yield*/, new ethers_1.ethers.Contract(contracts[0], [
                            "function balanceOf(address account) external view returns (uint256)",
                        ], crypto_1.providers[blockchains[0]]).balanceOf(address)];
                case 16:
                    circulating_supply = _e - (_f.sent()).toBigInt();
                    _f.label = 17;
                case 17:
                    _c++;
                    return [3 /*break*/, 13];
                case 18: return [2 /*return*/, { circulatingSupply: Number(circulating_supply) }];
            }
        });
    });
}
function getForSure(promise) {
    return __awaiter(this, void 0, void 0, function () {
        var success, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    success = false;
                    _a.label = 1;
                case 1:
                    if (!!success) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, promise];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    e_5 = _a.sent();
                    console.log(e_5);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
