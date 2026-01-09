import { ethers } from "ethers";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ethereum: any;
    }
}

const MNEE_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

const AEGIS_ABI = [
    "event Executed(address indexed target, bytes4 indexed selector, uint256 value, bytes data)",
    "event PolicyViolation(address indexed target, bytes4 indexed selector, string reason, bytes data)",
    "function setPolicy(address target, bytes4 selector, bool allowed) external",
    "function setRecipientWhitelist(address recipient, bool allowed) external"
];

const SEPOLIA_RPC_FALLBACKS = [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc.ankr.com/eth_sepolia",
    "https://eth-sepolia.public.blastapi.io"
];

const MAINNET_RPC = "https://eth.llamarpc.com";

export async function getETHBalance(walletAddress: string, isRealMode: boolean = false): Promise<string> {
    try {
        const rpcUrl = isRealMode ? MAINNET_RPC : (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || SEPOLIA_RPC_FALLBACKS[0]);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(walletAddress);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error("Error fetching ETH balance:", error);
        return "0.00";
    }
}

export async function getMNEEBalance(walletAddress: string, mneeAddress: string, isRealMode: boolean = false): Promise<string> {
    try {
        const rpcUrl = isRealMode ? MAINNET_RPC : (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || SEPOLIA_RPC_FALLBACKS[0]);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(mneeAddress, MNEE_ABI, provider);

        const balance = await contract.balanceOf(walletAddress);
        const decimals = await contract.decimals();

        return ethers.formatUnits(balance, decimals);
    } catch (error) {
        console.error("Error fetching MNEE balance:", error);
        return "0.00";
    }
}

export async function getLiveTransactions(aegisAddress: string) {
    try {
        const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || SEPOLIA_RPC_FALLBACKS[0];
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(aegisAddress, AEGIS_ABI, provider);

        // Fetch both Executed (Success) and PolicyViolation (Blocked) events
        const executedFilter = contract.filters.Executed();
        const violationFilter = contract.filters.PolicyViolation();

        const [executedEvents, violationEvents] = await Promise.all([
            contract.queryFilter(executedFilter, -10000),
            contract.queryFilter(violationFilter, -10000)
        ]);

        const allEvents = [...executedEvents, ...violationEvents].sort((a, b) => {
            return (b.blockNumber || 0) - (a.blockNumber || 0);
        });

        return allEvents.map(event => {
            // @ts-ignore
            const { target, selector, value, data, reason } = event.args;
            const isBlocked = !!reason; // If reason exists, it's a violation

            return {
                id: event.transactionHash,
                agentName: "Aegis-Agent",
                action: `Call: ${selector}`,
                target: target,
                amount: value ? ethers.formatEther(value) : "0.0",
                status: isBlocked ? "BLOCKED" : "SUCCESS" as "SUCCESS" | "WARNING" | "BLOCKED",
                timestamp: "LIVE",
                aiAnalysis: isBlocked ? `BLOCKED: ${reason}` : "Verified on-chain execution via AegisGuard.",
                isSimulated: false
            };
        });
    } catch (error) {
        console.error("Error fetching live transactions:", error);
        return [];
    }
}

// Helper to ensure user is on correct network
async function checkAndSwitchNetwork(provider: ethers.BrowserProvider, isRealMode: boolean = false) {
    const TARGET_CHAIN_ID = isRealMode ? "0x1" : "0xaa36a7"; // Mainnet vs Sepolia
    const TARGET_CHAIN_ID_INT = isRealMode ? BigInt(1) : BigInt(11155111);

    const network = await provider.getNetwork();

    if (network.chainId !== TARGET_CHAIN_ID_INT) {
        try {
            await provider.send("wallet_switchEthereumChain", [{ chainId: TARGET_CHAIN_ID }]);
        } catch (switchError: any) {
            if (switchError.code === 4902 && !isRealMode) {
                try {
                    await provider.send("wallet_addEthereumChain", [{
                        chainId: TARGET_CHAIN_ID,
                        chainName: "Sepolia Test Network",
                        nativeCurrency: {
                            name: "Sepolia ETH",
                            symbol: "SepoliaETH",
                            decimals: 18
                        },
                        rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
                        blockExplorerUrls: ["https://sepolia.etherscan.io"]
                    }]);
                } catch (addError) {
                    throw new Error("Failed to add network to wallet.");
                }
            } else {
                throw new Error(`Please switch to ${isRealMode ? 'Ethereum Mainnet' : 'Sepolia Testnet'} in MetaMask.`);
            }
        }
    }
}

export async function setPolicy(aegisAddress: string, target: string, selector: string, allowed: boolean) {
    try {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error("No crypto wallet found. Please install MetaMask or use a compatible browser.");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await checkAndSwitchNetwork(provider, false); // Policies only on Sepolia for now

        // Ensure accounts are connected
        await provider.send("eth_requestAccounts", []);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(aegisAddress, AEGIS_ABI, signer);

        const tx = await contract.setPolicy(target, selector, allowed);
        await tx.wait();
        return true;
    } catch (error: any) {
        console.error("Error setting policy:", error);
        if (error.code === 4001) {
            alert("Transaction rejected by user.");
        } else {
            alert(`Error: ${error.message || "Failed to set policy"}`);
        }
        return false;
    }
}

export async function whitelistRecipient(aegisAddress: string, recipient: string, allowed: boolean) {
    try {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error("No crypto wallet found.");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await checkAndSwitchNetwork(provider, false);

        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(aegisAddress, AEGIS_ABI, signer);

        const tx = await contract.setRecipientWhitelist(recipient, allowed);
        await tx.wait();
        return true;
    } catch (error: any) {
        console.error("Error whitelisting recipient:", error);
        alert(`Error: ${error.message || "Failed to whitelist recipient"}`);
        return false;
    }
}

export async function addTokenToWallet(tokenAddress: string, symbol: string, decimals: number, isRealMode: boolean = false) {
    try {
        if (!window.ethereum) return false;
        const provider = new ethers.BrowserProvider(window.ethereum);
        await checkAndSwitchNetwork(provider, isRealMode);

        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenAddress,
                    symbol: symbol,
                    decimals: decimals,
                },
            },
        });
        return true;
    } catch (error) {
        console.error("Error adding token to wallet:", error);
        return false;
    }
}

export async function mintMNEE(tokenAddress: string, amount: string) {
    try {
        if (!window.ethereum) throw new Error("No crypto wallet found");

        const provider = new ethers.BrowserProvider(window.ethereum);
        await checkAndSwitchNetwork(provider, false); // Mint only on Sepolia

        const signer = await provider.getSigner();

        // Basic ERC20 Mint ABI
        const MINT_ABI = ["function mint(address to, uint256 amount) public"];
        const contract = new ethers.Contract(tokenAddress, MINT_ABI, signer);

        const userAddress = await signer.getAddress();
        const decimals = 18;
        const amountWei = ethers.parseUnits(amount, decimals);

        const tx = await contract.mint(userAddress, amountWei);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error minting MNEE:", error);
        alert("Minting failed. Ensure you have Sepolia ETH for gas.");
        return false;
    }
}
