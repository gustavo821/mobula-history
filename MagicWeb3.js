"use strict";
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
exports.loadProxies = exports.MagicWeb3 = void 0;
var axios_1 = require("axios");
var web3_1 = require("web3");
var web3_providers_http_1 = require("web3-providers-http");
var https_proxy_agent_1 = require("https-proxy-agent");
var MagicWeb3 = /** @class */ (function () {
    function MagicWeb3(rpcs, proxies, alert) {
        if (proxies === void 0) { proxies = []; }
        if (alert === void 0) { alert = true; }
        this.rpcs = typeof rpcs == "string" ? [rpcs] : rpcs;
        this.alert = alert;
        this.proxies = proxies;
        this.fetchProxies();
        this.index = 0;
        // setInterval(() => this.fetchProxies(), 60000);
    }
    MagicWeb3.prototype.eth = function () {
        var proxy = this.proxies[this.index % this.proxies.length];
        this.index++;
        // console.log('Fetching with ', proxy)
        return new web3_1["default"](new web3_providers_http_1["default"](this.rpcs[Math.floor(Math.random() * this.rpcs.length)], {
            keepAlive: true,
            timeout: 20000,
            withCredentials: false,
            agent: {
                https: new https_proxy_agent_1.HttpsProxyAgent(proxy)
            }
        })).eth;
    };
    MagicWeb3.prototype.contract = function (abi, address) {
        var proxy = this.proxies[this.index % this.proxies.length];
        this.index++;
        var web3 = new web3_1["default"](new web3_providers_http_1["default"](this.rpcs[Math.floor(Math.random() * this.rpcs.length)], {
            keepAlive: true,
            timeout: 20000,
            withCredentials: false,
            agent: {
                https: new https_proxy_agent_1.HttpsProxyAgent(proxy)
            }
        }));
        return new web3.eth.Contract(abi, address);
    };
    MagicWeb3.prototype.fetchProxies = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var data, i, _d, _e, e_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        data = [];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, , 7]);
                        i = 1;
                        _f.label = 2;
                    case 2:
                        if (!(i <= this.proxies.length / 250)) return [3 /*break*/, 5];
                        _e = (_d = data).concat;
                        return [4 /*yield*/, axios_1["default"].get("https://proxy.webshare.io/api/proxy/list/?page=" + i, {
                                headers: {
                                    Authorization: "Token a9b1c399948e3ccebe42d363fec3c3ef5f00c7e4"
                                }
                            })];
                    case 3:
                        data = _e.apply(_d, [(_c = (_b = (_a = (_f.sent())) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.results) === null || _c === void 0 ? void 0 : _c.map(function (proxy) {
                                return ("http://" +
                                    proxy.username +
                                    ":" +
                                    proxy.password +
                                    "@" +
                                    proxy.proxy_address +
                                    ":" +
                                    proxy.ports.http);
                            })]);
                        _f.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (data && data.length > 0) {
                            console.log("(MagicWeb3) : updated proxies");
                            this.proxies = data;
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _f.sent();
                        console.log("Proxies are down. Impossible to refresh proxies.");
                        if (this.alert) {
                            axios_1["default"]
                                .post("https://hooks.slack.com/services/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", {
                                channel: "high-severity",
                                text: "Proxies are down. Impossible to refresh proxies."
                            })["catch"](function (e) {
                                console.log("MagicWeb3) Slack error : " + e);
                            });
                        }
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MagicWeb3;
}());
exports.MagicWeb3 = MagicWeb3;
var loadProxies = function (pages) { return __awaiter(void 0, void 0, void 0, function () {
    var data, i, _a, _b;
    var _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                data = [];
                i = 1;
                _f.label = 1;
            case 1:
                if (!(i <= pages)) return [3 /*break*/, 4];
                _b = (_a = data).concat;
                return [4 /*yield*/, axios_1["default"].get("https://proxy.webshare.io/api/proxy/list/?page=" + i, {
                        headers: {
                            Authorization: "Token a9b1c399948e3ccebe42d363fec3c3ef5f00c7e4"
                        }
                    })];
            case 2:
                data = _b.apply(_a, [(_e = (_d = (_c = (_f.sent())) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.results) === null || _e === void 0 ? void 0 : _e.map(function (proxy) {
                        return ("http://" +
                            proxy.username +
                            ":" +
                            proxy.password +
                            "@" +
                            proxy.proxy_address +
                            ":" +
                            proxy.ports.http);
                    })]);
                _f.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, data];
        }
    });
}); };
exports.loadProxies = loadProxies;
