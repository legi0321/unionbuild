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

    const amountInWei = ethers.utils.parseUnits(AMOUNT, 18); // SEI native typically 18 decimals

    console.log("\n🚀 Starting bridge from SEI EVM to XION Cosmos");
    console.log("From address:", wallet.address);
    console.log("To Cosmos:", RECEIVER);
    console.log("Amount:", AMOUNT, "SEI");

    const tx = await contract.transferToCosmos(
      ASSET_ADDRESS,
      amountInWei,
      RECEIVER,
      "xion-testnet-2",
      {
        gasLimit: 300_000,
        value: amountInWei, // Required for native SEI transfer
      }
    );

    console.log("\u23F3 Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("\n✅ Transaction confirmed!");
    console.log("TX Hash:", receipt.transactionHash);
  } catch (error) {
    console.error("\n❌ Transaction failed:", error.message);
  }
}

bridgeSeiToXion();
