require("dotenv").config();
const { DirectSecp256k1Wallet } = require("@cosmjs/proto-signing");
const { SigningStargateClient } = require("@cosmjs/stargate");
const { fromHex } = require("@cosmjs/encoding");
const config = require("./config");

async function main() {
  const privateKeyHex = process.env.PRIVATE_KEY_SEI;
  if (!privateKeyHex || privateKeyHex.length !== 64) {
    throw new Error("Private key tidak valid atau tidak ditemukan.");
  }

  const privateKey = fromHex(privateKeyHex);
  const wallet = await DirectSecp256k1Wallet.fromKey(privateKey, config.sei.prefix);
  const [account] = await wallet.getAccounts();

  const client = await SigningStargateClient.connectWithSigner(config.sei.rpc, wallet);

  console.log(`🚀 Mengirim ${config.transferAmount} ${config.sei.denom} dari ${account.address} ke ${config.xion.recipient}`);

  const fee = {
    amount: [
      {
        denom: config.sei.denom,
        amount: config.fee,
      },
    ],
    gas: config.gas,
  };

  const result = await client.sendIbcTokens(
    account.address,
    config.xion.recipient,
    {
      denom: config.sei.denom,
      amount: config.transferAmount,
    },
    "transfer",
    config.sei.channelToXion,
    undefined,
    Math.floor(Date.now() / 1000) + 600,
    fee,
    "IBC SEI → XION"
  );

  console.log("✅ Status:", result.code === 0 ? "Sukses" : "Gagal", result.transactionHash);
}

main().catch(console.error);
