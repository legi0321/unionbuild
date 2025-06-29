module.exports = {
  sei: {
    rpc: "https://sei-rpc.polkachu.com", // testnet/mainnet sesuai kebutuhan
    prefix: "sei",
    denom: "usei",
    channelToXion: "channel-0", // Ganti ke channel IBC sebenarnya
  },
  transferAmount: "1000", // = 0.001 SEI
  gas: "200000",
  fee: "5000", // dalam usei
  repeatCount: 10, // berapa kali setiap akun kirim
  delayMs: 3000, // jeda 3 detik antar transaksi
};
