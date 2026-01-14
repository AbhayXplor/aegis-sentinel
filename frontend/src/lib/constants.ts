export const MOCK_TOKEN_ADDRESS = "0x469470675401b92f1D7f1e83B4660FE51026746e";
export const REAL_TOKEN_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";

export const KNOWN_ENTITIES: Record<string, string> = {
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": "Uniswap V2 Router",
    "0x1234567890123456789012345678901234567890": "Unknown Wallet (Phishing)",
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef": "Blacklisted Mixer",
    "0x9999999999999999999999999999999999999999": "Suspicious Address",
    "0x4242424242424242424242424242424242424242": "OpenAI API Billing",
    "0x5555555555555555555555555555555555555555": "Anthropic Credits",
    "0x6666666666666666666666666666666666666666": "AWS Infrastructure",
    "0x7777777777777777777777777777777777777777": "Deel Payroll",
    [MOCK_TOKEN_ADDRESS]: "Aegis Sentinel (Mock)",
    [REAL_TOKEN_ADDRESS]: "Aegis Sentinel (Real)"
};

export const VALID_TARGETS = [
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap
    "0x4242424242424242424242424242424242424242", // OpenAI
    "0x5555555555555555555555555555555555555555", // Anthropic
    "0x6666666666666666666666666666666666666666", // AWS
    "0x7777777777777777777777777777777777777777"  // Deel
];

export const TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

export const SUPPORTED_TOKENS = [
    { symbol: "AEGIS", name: "Aegis Sentinel Token", address: REAL_TOKEN_ADDRESS, decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
    { symbol: "SHIB", name: "Shiba Inu", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18 },
    { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
    { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 }
];
