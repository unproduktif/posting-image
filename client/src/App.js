import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Profile from "./pages/Profile";

import { ethers } from "ethers";
import CONTRACT_ABI from "./abi/PostingImage.json";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  // =====================================================
  // CONNECT WALLET
  // =====================================================
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (err) {
      console.error("User rejected:", err);
    }
  };

  // =====================================================
  // LOAD CONTRACT
  // =====================================================
  const loadBlockchain = async () => {
    if (!window.ethereum || !account) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const c = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI.abi,
        signer
      );

      setContract(c);
    } catch (err) {
      console.error("Contract load error:", err);
    }
  };

  useEffect(() => {
    loadBlockchain();
  }, [account]);

  // =====================================================
  // LISTEN FOR ACCOUNT / NETWORK CHANGE
  // =====================================================
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (acc) => {
      setAccount(acc.length ? acc[0] : null);
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================
  const logoutWallet = () => {
    setAccount(null);
    setContract(null);
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <Router>
      <div className="App">
        {/* NAVBAR */}
        <nav className="navbar">
          <h2 style={{ letterSpacing: "1px" }}>MetaSnap</h2>

          <div className="nav-links">
            {account ? (
              <>
                <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                  Feed
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  Profil
                </NavLink>

                <span className="wallet-address-display">
                  {account.substring(0, 6)}...
                  {account.substring(account.length - 4)}
                </span>

                <button className="btn-secondary" onClick={logoutWallet}>Logout</button>
              </>
            ) : (
              <button className="btn-primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </nav>

        {/* ROUTING */}
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={
                account ? (
                  <Home account={account} contract={contract} />
                ) : (
                  <LoginPage connectWallet={connectWallet} />
                )
              }
            />

            <Route
              path="/profile"
              element={
                account ? (
                  <Profile account={account} contract={contract} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function LoginPage({ connectWallet }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "50px" }}>
      <h2>Selamat Datang di MetaSnap!</h2>
      <p>Hubungkan MetaMask untuk melanjutkan.</p>
      <button className="btn-primary" onClick={connectWallet}>
        Hubungkan MetaMask
      </button>
    </div>
  );
}

export default App;
