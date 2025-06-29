
require("dotenv").config();
const { ethers } = require("ethers");

// Load environment variables
const {
  PRIVATE_KEY,
  RPC_URL,
  CONTRACT_ADDRESS,
  RECEIVER,
  AMOUNT,
  ASSET_ADDRESS,
  SWAP_COUNT
} = process.env;

// Union Protocol contract ABI (simplified example for native token bridging)
const ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "destinationAddress", "type": "string" },
      { "internalType": "string", "name": "destinationChain", "type": "string" }
    ],
    "name": "transferToCosmos",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

async function bridgeSeiToXion() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const amountInWei = ethers.utils.parseUnits(AMOUNT, 18);

    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Wallet balance:", ethers.utils.formatEther(balance), "SEI");
    if (balance.lt(amountInWei)) {
      console.error("❌ Not enough SEI to continue");
      return;
    }

    for (let i = 1; i <= parseInt(SWAP_COUNT); i++) {
      console.log(`\n🔁 [${i}/${SWAP_COUNT}] Starting swap`);
      const tx = await contract.transferToCosmos(
        ASSET_ADDRESS,
        amountInWei,
        RECEIVER,
        "xion-testnet-2",
        {
          gasLimit: 300_000,
          value: amountInWei
        }
      );

      console.log("⏳ Waiting for transaction to confirm...");
      const receipt = await tx.wait();
      console.log("✅ Swap", i, "confirmed! TX Hash:", receipt.transactionHash);
    }

    console.log("\n🎉 All swaps complete!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

bridgeSeiToXion();
