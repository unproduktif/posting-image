// client/src/App.js
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
import { getContract } from "./utils/contract";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) 
      return alert("Install MetaMask terlebih dahulu!");

    try {
      // 1. Paksa MetaMask buka popup pilihan akun
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // 2. Ambil akun setelah user memilih
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

    } catch (err) {
      console.error("User rejected:", err);
    }
  };

  // LOAD CONTRACT SETIAP KALI ACCOUNT BERUBAH
  useEffect(() => {
    const init = async () => {
      if (!account) {
        setContract(null);
        return;
      }
      try {
        setLoadingContract(true);
        const c = await getContract();
        setContract(c);
      } catch (err) {
        console.error("Gagal load contract:", err);
        alert("Gagal menghubungkan ke smart contract. Cek console.");
      } finally {
        setLoadingContract(false);
      }
    };
    init();
  }, [account]);

  // LISTENER AKUN / NETWORK
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setContract(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const logoutWallet = () => {
    setAccount(null);
    setContract(null);
    setTimeout(() => window.location.reload(), 150);
  };

  return (
    <Router>
      <div className="App">
        {/* NAVBAR MODIFIED */}
        <nav className="navbar">
          <div className="navbar-inner">
            <h2 className="navbar-logo">MetaSnap</h2>

            <div className="nav-links">
              {account ? (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                  >
                    Feed
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                  >
                    Profil
                  </NavLink>

                  <span className="badge-address">
                    {account.substring(0, 6)}...
                    {account.substring(account.length - 4)}
                  </span>

                  <button className="btn-secondary btn-sm" onClick={logoutWallet}>
                    Logout
                  </button>
                </>
              ) : null /* Tombol Connect dihapus di sini sesuai permintaan */}
            </div>
          </div>
        </nav>

        {/* KONTEN */}
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={
                account ? (
                  <Home
                    account={account}
                    contract={contract}
                    loadingContract={loadingContract}
                  />
                ) : (
                  <LoginPage connectWallet={connectWallet} />
                )
              }
            />
            <Route
              path="/profile"
              element={
                account ? (
                  <Profile
                    account={account}
                    contract={contract}
                    loadingContract={loadingContract}
                  />
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
    <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
      <h2>Selamat Datang di MetaSnap!</h2>
      <p style={{marginBottom: "24px"}}>Hubungkan dompet MetaMask untuk mulai berbagi momen.</p>
      <button className="btn-primary" onClick={connectWallet}>
        Hubungkan MetaMask
      </button>
    </div>
  );
}

export default App;