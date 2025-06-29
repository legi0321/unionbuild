require("dotenv").config();
const { DirectSecp256k1Wallet } = require("@cosmjs/proto-signing");
const { SigningStargateClient } = require("@cosmjs/stargate");
const { fromHex } = require("@cosmjs/encoding");
const config = require("./config");

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getWalletsFromEnv() {
  const wallets = [];
  const keys = Object.keys(process.env);
  const walletIds = new Set();

  keys.forEach((key) => {
    const match = key.match(/^WALLET_(\d+)_KEY$/);
    if (match) walletIds.add(match[1]);
  });

  for (const id of walletIds) {
    const pk = process.env[`WALLET_${id}_KEY`];
    const to = process.env[`WALLET_${id}_TO`];
    if (pk && to) {
      wallets.push({ privateKey: pk, recipient: to });
    }
  }

  return wallets;
}

async function transferFromWallet({ privateKey, recipient }) {
  const wallet = await DirectSecp256k1Wallet.fromKey(fromHex(privateKey), config.sei.prefix);
  const [account] = await wallet.getAccounts();
  const client = await SigningStargateClient.connectWithSigner(config.sei.rpc, wallet);

  const fee = {
    amount: [{ denom: config.sei.denom, amount: config.fee }],
    gas: config.gas,
  };

  console.log(`🚀 ${account.address} kirim ke ${recipient}`);

  for (let i = 0; i < config.repeatCount; i++) {
    const timeout = Math.floor(Date.now() / 1000) + 600;
    try {
      const result = await client.sendIbcTokens(
        account.address,
        recipient,
        {
          denom: config.sei.denom,
          amount: config.transferAmount,
        },
        "transfer",
        config.sei.channelToXion,
        undefined,
        timeout,
        fee,
        `TX ${i + 1}`
      );

      console.log(`✅ TX ${i + 1}: ${result.code === 0 ? "SUKSES" : "GAGAL"} | Hash: ${result.transactionHash}`);
    } catch (err) {
      console.error(`❌ Gagal TX ${i + 1} - ${err.message}`);
    }

    if (i < config.repeatCount - 1) await sleep(config.delayMs);
  }
}

async function main() {
  const wallets = getWalletsFromEnv();
  for (const wallet of wallets) {
    await transferFromWallet(wallet);
    console.log("⏱️ Selesai akun\n");
  }
}

main().catch(console.error);
