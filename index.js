require("dotenv").config();
const { ethers } = require("ethers");

const {
  SEI_PRIVATE_KEYS,
  RPC_URL,
  CONTRACT_ADDRESS,
  RECEIVER,
  AMOUNT,
  ASSET_ADDRESS,
  SWAP_COUNT,
  TX_DELAY_MS,
  WALLET_DELAY_MS,
  LOOP,
  LOOP_INTERVAL_MS
} = process.env;

const ABI = [
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "destinationAddress", type: "string" },
      { internalType: "string", name: "destinationChain", type: "string" }
    ],
    name: "transferToCosmos",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
];

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function swapWithWallet(pk, index) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(pk, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    const amountInWei = ethers.parseUnits(AMOUNT, 18);
    const balance = await provider.getBalance(wallet.address);

    console.log(`\n[${index + 1}] 🔑 ${wallet.address}`);
    console.log(`   💰 Balance: ${ethers.formatEther(balance)} SEI`);

    if (balance.lt(amountInWei)) {
      console.log("   ❌ Not enough balance");
      return;
    }

    for (let i = 0; i < Number(SWAP_COUNT); i++) {
      console.log(`   🔁 Swap [${i + 1}/${SWAP_COUNT}]`);
      const tx = await contract.transferToCosmos(
        ASSET_ADDRESS,
        amountInWei,
        RECEIVER,
        "xion-testnet-2",
        {
          gasLimit: 300000,
          value: amountInWei
        }
      );
      const receipt = await tx.wait();
      console.log(`   ✅ TX Confirmed: ${receipt.hash}`);
      await sleep(Number(TX_DELAY_MS));
    }
  } catch (e) {
    console.error(`   ❌ Wallet ${index + 1} Error:`, e.message);
  }
}

async function runAllWallets() {
  const keys = SEI_PRIVATE_KEYS.split(",");
  for (let i = 0; i < keys.length; i++) {
    await swapWithWallet(keys[i], i);
    if (i < keys.length - 1) await sleep(Number(WALLET_DELAY_MS));
  }
}

(async () => {
  if (LOOP === "true") {
    while (true) {
      console.log("\n🚀 [LOOP START]");
      await runAllWallets();
      console.log("🕒 Menunggu next loop...\n");
      await sleep(Number(LOOP_INTERVAL_MS));
    }
  } else {
    await runAllWallets();
    console.log("✅ Semua wallet selesai (no-loop).");
  }
})();
