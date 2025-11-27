require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    // 1. Development (Ganache)
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },

    // 2. TENDERLY (Virtual Testnet)
    // Kita ganti blok 'sepolia' tadi menjadi 'tenderly'
    tenderly: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,    // Pastikan ini ada di .env
        process.env.TENDERLY_URL    // Pastikan URL Tenderly ada di .env
      ),
      network_id: "*",              // Kita set bintang agar otomatis cocok
      gas: 5500000,
      skipDryRun: true
    },
  },

  compilers: {
    solc: {
      version: "0.8.17",
    }
  },
};