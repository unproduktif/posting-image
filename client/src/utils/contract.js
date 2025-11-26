// client/src/utils/contract.js
import { ethers } from "ethers";
import ABI from "../abi/PostingImage.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask tidak ditemukan. Tolong install MetaMask.");
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("REACT_APP_CONTRACT_ADDRESS belum diset di file .env");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
  return contract;
};
