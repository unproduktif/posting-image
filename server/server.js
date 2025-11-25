require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { ethers } = require("ethers");
const simpleStorageJSON = require("./abi/SimpleStorage.json");

const app = express();
app.use(cors());
app.use(express.json());

// Storage untuk upload image
const upload = multer({ dest: "uploads/" });

// Connect ke Ganache
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  simpleStorageJSON.abi,
  wallet
);

// API get value dari blockchain
app.get("/value", async (req, res) => {
  const v = await contract.value();
  res.json({ value: Number(v) });
});

// API set value ke blockchain
app.post("/value", async (req, res) => {
  const tx = await contract.setValue(req.body.value);
  await tx.wait();
  res.json({ message: "Value updated!" });
});

// API upload image
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded!",
    file: req.file,
  });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
