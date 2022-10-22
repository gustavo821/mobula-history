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
exports.createPairsSupabaseClient = exports.getShardedPairsFromAddresses = exports.getShardedPairsFromTokenId = exports.blocksBlockchains = exports.PAIR_ABI = exports.API_ABI = exports.PROTOCOL_ABI = exports.dexABI = exports.uniswapV2ABI = exports.ERC20ABI = exports.providers = exports.FantomProvider = exports.AvalancheProvider = exports.PolygonProvider = exports.EthereumProvider = exports.BNBProvider = exports.DEAD_WALLETS = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var ethers_1 = require("ethers");
var config_1 = require("../config");
exports.DEAD_WALLETS = [
    "0x000000000000000000000000000000000000dEaD",
    "0x0000000000000000000000000000000000000000",
];
exports.BNBProvider = ethers_1.ethers.getDefaultProvider("https://bsc-dataseed.binance.org/");
exports.EthereumProvider = ethers_1.ethers.getDefaultProvider("https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
exports.PolygonProvider = ethers_1.ethers.getDefaultProvider("https://polygon-rpc.com");
exports.AvalancheProvider = ethers_1.ethers.getDefaultProvider("https://api.avax.network/ext/bc/C/rpc");
exports.FantomProvider = ethers_1.ethers.getDefaultProvider("https://rpc.ftm.tools/");
var CronosProvider = ethers_1.ethers.getDefaultProvider("https://evm.cronos.org/");
exports.providers = {
    "BNB Smart Chain (BEP20)": exports.BNBProvider,
    Fantom: exports.FantomProvider,
    Polygon: exports.PolygonProvider,
    "Avalanche C-Chain": exports.AvalancheProvider,
    Ethereum: exports.EthereumProvider,
    Cronos: CronosProvider
};
exports.ERC20ABI = [
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "_upgradedAddress", type: "address" }],
        name: "deprecate",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { name: "_spender", type: "address" },
            { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "deprecated",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "_evilUser", type: "address" }],
        name: "addBlackList",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { name: "_from", type: "address" },
            { name: "_to", type: "address" },
            { name: "_value", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "upgradedAddress",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ name: "", type: "address" }],
        name: "balances",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "maximumFee",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "_totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [],
        name: "unpause",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ name: "_maker", type: "address" }],
        name: "getBlackListStatus",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            { name: "", type: "address" },
            { name: "", type: "address" },
        ],
        name: "allowed",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "paused",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ name: "who", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [],
        name: "pause",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getOwner",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { name: "_to", type: "address" },
            { name: "_value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { name: "newBasisPoints", type: "uint256" },
            { name: "newMaxFee", type: "uint256" },
        ],
        name: "setParams",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "amount", type: "uint256" }],
        name: "issue",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "amount", type: "uint256" }],
        name: "redeem",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            { name: "_owner", type: "address" },
            { name: "_spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "remaining", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "basisPointsRate",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ name: "", type: "address" }],
        name: "isBlackListed",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "_clearedUser", type: "address" }],
        name: "removeBlackList",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "MAX_UINT",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ name: "_blackListedUser", type: "address" }],
        name: "destroyBlackFunds",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { name: "_initialSupply", type: "uint256" },
            { name: "_name", type: "string" },
            { name: "_symbol", type: "string" },
            { name: "_decimals", type: "uint256" },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: "amount", type: "uint256" }],
        name: "Issue",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: "amount", type: "uint256" }],
        name: "Redeem",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: "newAddress", type: "address" }],
        name: "Deprecate",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "feeBasisPoints", type: "uint256" },
            { indexed: false, name: "maxFee", type: "uint256" },
        ],
        name: "Params",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "_blackListedUser", type: "address" },
            { indexed: false, name: "_balance", type: "uint256" },
        ],
        name: "DestroyedBlackFunds",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: "_user", type: "address" }],
        name: "AddedBlackList",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: "_user", type: "address" }],
        name: "RemovedBlackList",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "owner", type: "address" },
            { indexed: true, name: "spender", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
        ],
        name: "Approval",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
        ],
        name: "Transfer",
        type: "event"
    },
    { anonymous: false, inputs: [], name: "Pause", type: "event" },
    { anonymous: false, inputs: [], name: "Unpause", type: "event" },
];
exports.uniswapV2ABI = [
    {
        inputs: [
            { internalType: "address", name: "_factory", type: "address" },
            { internalType: "address", name: "_WETH", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        inputs: [],
        name: "WETH",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "uint256", name: "amountADesired", type: "uint256" },
            { internalType: "uint256", name: "amountBDesired", type: "uint256" },
            { internalType: "uint256", name: "amountAMin", type: "uint256" },
            { internalType: "uint256", name: "amountBMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "addLiquidity",
        outputs: [
            { internalType: "uint256", name: "amountA", type: "uint256" },
            { internalType: "uint256", name: "amountB", type: "uint256" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amountTokenDesired", type: "uint256" },
            { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
            { internalType: "uint256", name: "amountETHMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "addLiquidityETH",
        outputs: [
            { internalType: "uint256", name: "amountToken", type: "uint256" },
            { internalType: "uint256", name: "amountETH", type: "uint256" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
        ],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [],
        name: "factory",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint256", name: "reserveIn", type: "uint256" },
            { internalType: "uint256", name: "reserveOut", type: "uint256" },
        ],
        name: "getAmountIn",
        outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
        stateMutability: "pure",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "reserveIn", type: "uint256" },
            { internalType: "uint256", name: "reserveOut", type: "uint256" },
        ],
        name: "getAmountOut",
        outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
        stateMutability: "pure",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
        ],
        name: "getAmountsIn",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
        ],
        name: "getAmountsOut",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountA", type: "uint256" },
            { internalType: "uint256", name: "reserveA", type: "uint256" },
            { internalType: "uint256", name: "reserveB", type: "uint256" },
        ],
        name: "quote",
        outputs: [{ internalType: "uint256", name: "amountB", type: "uint256" }],
        stateMutability: "pure",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
            { internalType: "uint256", name: "amountAMin", type: "uint256" },
            { internalType: "uint256", name: "amountBMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "removeLiquidity",
        outputs: [
            { internalType: "uint256", name: "amountA", type: "uint256" },
            { internalType: "uint256", name: "amountB", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
            { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
            { internalType: "uint256", name: "amountETHMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "removeLiquidityETH",
        outputs: [
            { internalType: "uint256", name: "amountToken", type: "uint256" },
            { internalType: "uint256", name: "amountETH", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
            { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
            { internalType: "uint256", name: "amountETHMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "removeLiquidityETHSupportingFeeOnTransferTokens",
        outputs: [{ internalType: "uint256", name: "amountETH", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
            { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
            { internalType: "uint256", name: "amountETHMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bool", name: "approveMax", type: "bool" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "removeLiquidityETHWithPermit",
        outputs: [
            { internalType: "uint256", name: "amountToken", type: "uint256" },
            { internalType: "uint256", name: "amountETH", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
            { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
            { internalType: "uint256", name: "amountETHMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bool", name: "approveMax", type: "bool" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
        outputs: [{ internalType: "uint256", name: "amountETH", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" },
            { internalType: "uint256", name: "amountAMin", type: "uint256" },
            { internalType: "uint256", name: "amountBMin", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bool", name: "approveMax", type: "bool" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "removeLiquidityWithPermit",
        outputs: [
            { internalType: "uint256", name: "amountA", type: "uint256" },
            { internalType: "uint256", name: "amountB", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapETHForExactTokens",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactETHForTokens",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForETH",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForTokens",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint256", name: "amountInMax", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapTokensForExactETH",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint256", name: "amountInMax", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapTokensForExactTokens",
        outputs: [
            { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    { stateMutability: "payable", type: "receive" },
];
exports.dexABI = [
    {
        inputs: [],
        name: "fee",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapETHForExactTokens",
        outputs: [
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
        ],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapExactETHForTokens",
        outputs: [
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
        ],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapExactTokensForETH",
        outputs: [
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapExactTokensForTokens",
        outputs: [
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amountInMax",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapTokensForExactETH",
        outputs: [
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amountInMax",
                type: "uint256"
            },
            {
                internalType: "address[]",
                name: "path",
                type: "address[]"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "deadline",
                type: "uint256"
            },
        ],
        name: "swapTokensForExactTokens",
        outputs: [
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "treasuryWallet",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        stateMutability: "payable",
        type: "receive"
    },
];
exports.PROTOCOL_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
        ],
        name: "DataSubmitted",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "validations",
                type: "uint256"
            },
        ],
        name: "FinalDecisionRejected",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "validations",
                type: "uint256"
            },
        ],
        name: "FinalDecisionValidated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "address",
                name: "voter",
                type: "address"
            },
            {
                indexed: false,
                internalType: "bool",
                name: "validated",
                type: "bool"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        name: "FinalValidationVote",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "validations",
                type: "uint256"
            },
        ],
        name: "FirstSortRejected",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "validations",
                type: "uint256"
            },
        ],
        name: "FirstSortValidated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "address",
                name: "voter",
                type: "address"
            },
            {
                indexed: false,
                internalType: "bool",
                name: "validated",
                type: "bool"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        name: "FirstSortVote",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "badFinalVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "badFirstVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "claimFinalRewards",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "claimRewards",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "demoted",
                type: "address"
            },
        ],
        name: "demote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "demoteVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "demoted",
                type: "address"
            },
        ],
        name: "emergencyDemote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "promoted",
                type: "address"
            },
        ],
        name: "emergencyPromote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "finalDecisionMaxVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "finalDecisionValidationsNeeded",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "validate",
                type: "bool"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        name: "finalDecisionVote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "finalDecisionVotes",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "finalValidationTokens",
        outputs: [
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "id",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastUpdate",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "firstSortMaxVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "firstSortTokens",
        outputs: [
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "id",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastUpdate",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "firstSortValidationsNeeded",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "validate",
                type: "bool"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        name: "firstSortVote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "firstSortVotes",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getFinalValidationTokens",
        outputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                internalType: "struct API.Token[]",
                name: "",
                type: "tuple[]"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getFirstSortTokens",
        outputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                internalType: "struct API.Token[]",
                name: "",
                type: "tuple[]"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getSubmittedTokens",
        outputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                internalType: "struct API.Token[]",
                name: "",
                type: "tuple[]"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "goodFinalVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "goodFirstVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "indexOfFinalValidationTokens",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "indexOfFirstSortTokens",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_owner",
                type: "address"
            },
            {
                internalType: "address",
                name: "_mobulaTokenAddress",
                type: "address"
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "membersToDemoteFromRankI",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "membersToDemoteFromRankII",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "membersToPromoteToRankI",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "membersToPromoteToRankII",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "paidFinalVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "paidFirstVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "promoted",
                type: "address"
            },
        ],
        name: "promote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "promoteVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "rank",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "contractAddresses",
                type: "address[]"
            },
            {
                internalType: "address[]",
                name: "totalSupplyAddresses",
                type: "address[]"
            },
            {
                internalType: "address[]",
                name: "excludedCirculationAddresses",
                type: "address[]"
            },
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
        ],
        name: "submitIPFS",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [],
        name: "submitPrice",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "submittedTokens",
        outputs: [
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "id",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastUpdate",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenFinalRejections",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenFinalValidations",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenFirstRejections",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenFirstValidations",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenMarketScore",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenSocialScore",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenTrustScore",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "tokenUtilityScore",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "tokensPerVote",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_finalDecisionMaxVotes",
                type: "uint256"
            },
        ],
        name: "updateFinalDecisionMaxVotes",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_finalDecisionValidationsNeeded",
                type: "uint256"
            },
        ],
        name: "updateFinalDecisionValidationsNeeded",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_firstSortMaxVotes",
                type: "uint256"
            },
        ],
        name: "updateFirstSortMaxVotes",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_firstSortValidationsNeeded",
                type: "uint256"
            },
        ],
        name: "updateFirstSortValidationsNeeded",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_membersToDemoteToRankI",
                type: "uint256"
            },
        ],
        name: "updateMembersToDemoteFromRankI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_membersToDemoteToRankII",
                type: "uint256"
            },
        ],
        name: "updateMembersToDemoteFromRankII",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_membersToPromoteToRankI",
                type: "uint256"
            },
        ],
        name: "updateMembersToPromoteToRankI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_membersToPromoteToRankII",
                type: "uint256"
            },
        ],
        name: "updateMembersToPromoteToRankII",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_protocolAPIAddress",
                type: "address"
            },
        ],
        name: "updateProtocolAPIAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_submitPrice",
                type: "uint256"
            },
        ],
        name: "updateSubmitPrice",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_tokensPerVote",
                type: "uint256"
            },
        ],
        name: "updateTokensPerVote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_voteCooldown",
                type: "uint256"
            },
        ],
        name: "updateVoteCooldown",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_votesNeededToRankIDemotion",
                type: "uint256"
            },
        ],
        name: "updateVotesNeededToRankIDemotion",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_votesNeededToRankIIDemotion",
                type: "uint256"
            },
        ],
        name: "updateVotesNeededToRankIIDemotion",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_votesNeededToRankIIPromotion",
                type: "uint256"
            },
        ],
        name: "updateVotesNeededToRankIIPromotion",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_votesNeededToRankIPromotion",
                type: "uint256"
            },
        ],
        name: "updateVotesNeededToRankIPromotion",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "voteCooldown",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "votesNeededToRankIDemotion",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "votesNeededToRankIIDemotion",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "votesNeededToRankIIPromotion",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "votesNeededToRankIPromotion",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
        ],
        name: "withdrawFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
];
exports.API_ABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_protocol",
                type: "address"
            },
            {
                internalType: "address",
                name: "_owner",
                type: "address"
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                indexed: false,
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
        ],
        name: "NewAssetListing",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "token",
                type: "address"
            },
            {
                indexed: false,
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
        ],
        name: "NewListing",
        type: "event"
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                internalType: "struct API.Token",
                name: "token",
                type: "tuple"
            },
        ],
        name: "addAssetData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address"
            },
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "assetId",
                type: "uint256"
            },
        ],
        name: "addStaticData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "assetById",
        outputs: [
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "id",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastUpdate",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "assets",
        outputs: [
            {
                internalType: "string",
                name: "ipfsHash",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "id",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastUpdate",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "utilityScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "socialScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "trustScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "marketScore",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getAllAssets",
        outputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "ipfsHash",
                        type: "string"
                    },
                    {
                        internalType: "address[]",
                        name: "contractAddresses",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256"
                    },
                    {
                        internalType: "address[]",
                        name: "totalSupply",
                        type: "address[]"
                    },
                    {
                        internalType: "address[]",
                        name: "excludedFromCirculation",
                        type: "address[]"
                    },
                    {
                        internalType: "uint256",
                        name: "lastUpdate",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "utilityScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "socialScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "trustScore",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "marketScore",
                        type: "uint256"
                    },
                ],
                internalType: "struct API.Token[]",
                name: "",
                type: "tuple[]"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "id",
                type: "uint256"
            },
        ],
        name: "getAssetContractsById",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            },
            {
                internalType: "address[]",
                name: "",
                type: "address[]"
            },
            {
                internalType: "address[]",
                name: "",
                type: "address[]"
            },
            {
                internalType: "address[]",
                name: "",
                type: "address[]"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "protocol",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address"
            },
        ],
        name: "removeStaticData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_protocol",
                type: "address"
            },
        ],
        name: "setProtocolAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "staticData",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "tokenAssetId",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
];
exports.PAIR_ABI = [
    {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "Approval",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1",
                type: "uint256"
            },
            { indexed: true, internalType: "address", name: "to", type: "address" },
        ],
        name: "Burn",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1",
                type: "uint256"
            },
        ],
        name: "Mint",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0In",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1In",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount0Out",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount1Out",
                type: "uint256"
            },
            { indexed: true, internalType: "address", name: "to", type: "address" },
        ],
        name: "Swap",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint112",
                name: "reserve0",
                type: "uint112"
            },
            {
                indexed: false,
                internalType: "uint112",
                name: "reserve1",
                type: "uint112"
            },
        ],
        name: "Sync",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "from", type: "address" },
            { indexed: true, internalType: "address", name: "to", type: "address" },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "Transfer",
        type: "event"
    },
    {
        constant: true,
        inputs: [],
        name: "DOMAIN_SEPARATOR",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "MINIMUM_LIQUIDITY",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "PERMIT_TYPEHASH",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "address", name: "to", type: "address" }],
        name: "burn",
        outputs: [
            { internalType: "uint256", name: "amount0", type: "uint256" },
            { internalType: "uint256", name: "amount1", type: "uint256" },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "factory",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
            { internalType: "uint112", name: "_reserve0", type: "uint112" },
            { internalType: "uint112", name: "_reserve1", type: "uint112" },
            { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "_token0", type: "address" },
            { internalType: "address", name: "_token1", type: "address" },
        ],
        name: "initialize",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "kLast",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "address", name: "to", type: "address" }],
        name: "mint",
        outputs: [{ internalType: "uint256", name: "liquidity", type: "uint256" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "nonces",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "permit",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "price0CumulativeLast",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "price1CumulativeLast",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "address", name: "to", type: "address" }],
        name: "skim",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "uint256", name: "amount0Out", type: "uint256" },
            { internalType: "uint256", name: "amount1Out", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "swap",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [],
        name: "sync",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "token0",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "token1",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
];
exports.blocksBlockchains = [
    {
        name: "Ethereum",
        eth: "Ethereum",
        rpc: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    },
    {
        name: "BNB Smart Chain (BEP20)",
        eth: "BNB",
        rpc: "https://bsc-dataseed.binance.org/"
    },
    {
        name: "Polygon",
        eth: "Polygon",
        rpc: "https://polygon-rpc.com"
    },
    {
        name: "Fantom",
        eth: "Fantom",
        rpc: "https://rpc.ftm.tools/"
    },
    {
        name: "Avalanche C-Chain",
        eth: "Avalanche",
        rpc: "https://api.avax.network/ext/bc/C/rpc"
    },
    {
        name: "Cronos",
        eth: "Cronos",
        rpc: "https://api.avax.network/ext/bc/C/rpc"
    },
    {
        name: "Arbitrum",
        eth: "Ethereum",
        rpc: "https://rpc.ankr.com/arbitrum"
    },
];
function getShardedPairsFromTokenId(id) {
    return __awaiter(this, void 0, void 0, function () {
        var hexa, supabasePairs, responses, finalArray, timeBefore, _loop_1, _i, hexa_1, hexaChar, timeAfter;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hexa = "0123456789abcdef";
                    return [4 /*yield*/, (0, exports.createPairsSupabaseClient)()];
                case 1:
                    supabasePairs = _a.sent();
                    responses = [];
                    finalArray = [];
                    timeBefore = Date.now();
                    _loop_1 = function (hexaChar) {
                        responses.push(new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var fetchedData, _a, data, error, _i, data_1, pair, e_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        fetchedData = false;
                                        _b.label = 1;
                                    case 1:
                                        if (!!fetchedData) return [3 /*break*/, 7];
                                        _b.label = 2;
                                    case 2:
                                        _b.trys.push([2, 4, , 6]);
                                        return [4 /*yield*/, supabasePairs
                                                .from("0x".concat(hexaChar))
                                                .select("*")
                                                .or("token0_id.eq.".concat(id, ",token1_id.eq.").concat(id))];
                                    case 3:
                                        _a = (_b.sent()), data = _a.data, error = _a.error;
                                        if (error) {
                                            throw "Supabase => ".concat(error.message);
                                        }
                                        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                                            pair = data_1[_i];
                                            finalArray.push(pair);
                                        }
                                        fetchedData = true;
                                        resolve(null);
                                        return [3 /*break*/, 6];
                                    case 4:
                                        e_1 = _b.sent();
                                        fetchedData = false;
                                        console.error("Error getShardedPairsFromTokenId: ".concat(e_1));
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(function () { return r(null); }, 1000); })];
                                    case 5:
                                        _b.sent();
                                        return [3 /*break*/, 6];
                                    case 6: return [3 /*break*/, 1];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); }));
                    };
                    for (_i = 0, hexa_1 = hexa; _i < hexa_1.length; _i++) {
                        hexaChar = hexa_1[_i];
                        _loop_1(hexaChar);
                    }
                    return [4 /*yield*/, Promise.all(responses)];
                case 2:
                    _a.sent();
                    timeAfter = Date.now();
                    console.log("getShardedPairsFromTokenId resolved 16 queries in ".concat((timeAfter - timeBefore) / 1000, " sec"));
                    return [2 /*return*/, finalArray];
            }
        });
    });
}
exports.getShardedPairsFromTokenId = getShardedPairsFromTokenId;
function getShardedPairsFromAddresses(addresses) {
    return __awaiter(this, void 0, void 0, function () {
        var hexa, supabasePairs, responses, finalArray, timeBefore, _loop_2, _i, hexa_2, hexaChar, timeAfter;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hexa = "0123456789abcdef";
                    return [4 /*yield*/, (0, exports.createPairsSupabaseClient)()];
                case 1:
                    supabasePairs = _a.sent();
                    responses = [];
                    finalArray = [];
                    timeBefore = Date.now();
                    _loop_2 = function (hexaChar) {
                        responses.push(new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var fetchedData, _a, data, error, _i, data_2, pair, e_2;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        fetchedData = false;
                                        _b.label = 1;
                                    case 1:
                                        if (!!fetchedData) return [3 /*break*/, 7];
                                        _b.label = 2;
                                    case 2:
                                        _b.trys.push([2, 4, , 6]);
                                        return [4 /*yield*/, supabasePairs
                                                .from("0x".concat(hexaChar))
                                                .select("*")["in"]("address", addresses)];
                                    case 3:
                                        _a = (_b.sent()), data = _a.data, error = _a.error;
                                        if (error) {
                                            throw "Supabase => ".concat(error.message);
                                        }
                                        for (_i = 0, data_2 = data; _i < data_2.length; _i++) {
                                            pair = data_2[_i];
                                            finalArray.push(pair);
                                        }
                                        fetchedData = true;
                                        resolve(null);
                                        return [3 /*break*/, 6];
                                    case 4:
                                        e_2 = _b.sent();
                                        fetchedData = false;
                                        console.error("Error getShardedPairsFromTokenId: ".concat(e_2));
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(function () { return r(null); }, 1000); })];
                                    case 5:
                                        _b.sent();
                                        return [3 /*break*/, 6];
                                    case 6: return [3 /*break*/, 1];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); }));
                    };
                    for (_i = 0, hexa_2 = hexa; _i < hexa_2.length; _i++) {
                        hexaChar = hexa_2[_i];
                        _loop_2(hexaChar);
                    }
                    return [4 /*yield*/, Promise.all(responses)];
                case 2:
                    _a.sent();
                    timeAfter = Date.now();
                    console.log("getShardedPairsFromTokenId resolved 16 queries in ".concat((timeAfter - timeBefore) / 1000, " sec"));
                    return [2 /*return*/, finalArray];
            }
        });
    });
}
exports.getShardedPairsFromAddresses = getShardedPairsFromAddresses;
var createPairsSupabaseClient = function () {
    return (0, supabase_js_1.createClient)("https://ynyevwlgdolrcfxzvqhr.supabase.co", config_1["default"].SUPABASE_PAIRS_KEY);
};
exports.createPairsSupabaseClient = createPairsSupabaseClient;
