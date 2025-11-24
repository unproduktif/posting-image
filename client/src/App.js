import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'; // Use NavLink for active styling
import { ethers } from 'ethers';
import './App.css';
import Home from './pages/Home';
import Profile from './pages/Profile';

function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (err) {
          console.error("Error checking wallet:", err);
        }
      }
    };
    checkWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
        } else {
          setAccount(null);
        }
      });
      // Handle chain changed event if needed
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload page on network change
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User menolak koneksi wallet:", error);
      }
    } else {
      alert("Harap install MetaMask untuk menggunakan aplikasi ini!");
    }
  };

  return (
    <Router>
      <div className="App">
        {/* NAVBAR */}
        <nav className="navbar">
          <h2>BlockchainGram</h2>
          <div className="nav-links">
            {account ? (
              <>
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Feed</NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profil</NavLink>
                <span className="wallet-address-display">
                  {account.substring(0,6)}...{account.substring(account.length-4)}
                </span>
              </>
            ) : (
              <button className="btn-primary" onClick={connectWallet}>Connect Wallet</button>
            )}
          </div>
        </nav>

        {/* KONTEN HALAMAN */}
        <div className="container">
          <Routes>
            <Route path="/" element={
              account ? <Home account={account} /> :
              <div className="card" style={{textAlign:'center', padding:'50px'}}>
                <h2 style={{marginBottom:'15px'}}>Selamat Datang di BlockchainGram!</h2>
                <p style={{marginBottom:'30px'}}>
                  Aplikasi media sosial terdesentralisasi Anda. Silakan hubungkan dompet MetaMask untuk memulai.
                </p>
                <button className="btn-primary" onClick={connectWallet}>Hubungkan MetaMask</button>
              </div>
            } />

            <Route path="/profile" element={
              account ? <Profile account={account} /> : <Navigate to="/" />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;