// client/src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { uploadToIPFS } from "../utils/ipfs";

// --- INLINE SVG ICONS ---
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const IconImage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

function Profile({ account, contract, loadingContract }) {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [postDescription, setPostDescription] = useState("");
  const [myPosts, setMyPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  // --- LOGIC ---
  const loadProfile = async () => {
    if (!contract || !account) return;
    setLoadingProfile(true);
    try {
      const name = await contract.usernames(account);
      setUsername(name && name.length > 0 ? name : "User Tanpa Nama");
    } catch (e) {
      console.error(e);
      setUsername("User Tanpa Nama");
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadMyPosts = async () => {
    if (!contract || !account) return;
    try {
      const total = await contract.totalPosts();
      const totalNum = Number(total);
      const mine = [];
      for (let i = totalNum - 1; i >= 0; i--) {
        const p = await contract.getPost(i);
        const author = p[1];
        if (author.toLowerCase() !== account.toLowerCase()) continue;
        mine.push({
          id: Number(p[0]),
          imageUrl: p[2],
          likes: Number(p[4]),
          commentCount: Number(p[6]),
        });
      }
      setMyPosts(mine);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadProfile();
      loadMyPosts();
    }
  }, [contract, account]);

  const handleUpdateName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) return alert("Nama kosong.");
    if (!contract) return alert("Contract error.");
    try {
      setTxLoading(true);
      const tx = await contract.setUsername(trimmed);
      await tx.wait();
      setUsername(trimmed);
      setTempName("");
      alert("Profil berhasil diupdate!");
    } catch (e) {
      console.error(e);
      alert("Gagal update profil.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleCreatePost = async () => {
    const desc = postDescription.trim();
    if (!selectedFile || !desc) return alert("Gambar dan deskripsi wajib diisi.");
    if (!contract) return alert("Contract error.");
    try {
      setTxLoading(true);
      const imageUrl = await uploadToIPFS(selectedFile);
      const tx = await contract.createPost(imageUrl, desc);
      await tx.wait();
      setPostDescription("");
      setSelectedFile(null);
      await loadMyPosts();
      alert("Berhasil diposting!");
    } catch (e) {
      console.error(e);
      alert("Gagal posting.");
    } finally {
      setTxLoading(false);
    }
  };

  // Helper tampilan address
  const formatFullAddress = (addr) => 
    addr ? `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}` : "";

  // --- RENDER ---
  if (!contract) return <div className="card text-center"><p>Silakan hubungkan wallet.</p></div>;

  return (
    <div>
      {/* 1. IDENTITY CARD */}
      <div className="card profile-cover">
        <div className="avatar profile-avatar-lg">
          {(username || "U").charAt(0).toUpperCase()}
        </div>
        
        <h2 className="profile-name-lg">
          {loadingProfile ? "..." : username}
        </h2>

        {/* Address Badge yang Elegan */}
        <div style={{ marginBottom: 24 }}>
          <span className="badge-address" title={account}>
            <span style={{opacity: 0.6}}>ID:</span> {formatFullAddress(account)}
          </span>
        </div>

        {/* Form Ganti Nama */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Ganti nama tampilan..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            style={{ maxWidth: "200px", textAlign: "center" }}
          />
          <button className="btn-secondary" onClick={handleUpdateName} disabled={txLoading}>
            <IconSave />
          </button>
        </div>
      </div>

      {/* 2. CREATE POST */}
      <div className="card">
        <h3 className="section-title">Buat Postingan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            rows="3"
            placeholder="Apa yang ingin Anda bagikan?"
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
          ></textarea>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{position: 'relative'}}>
              <button className="btn-secondary" style={{fontSize: 12}}>
                {selectedFile ? "Ganti Foto" : "Pilih Foto"}
              </button>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                style={{
                  position: 'absolute', top:0, left:0, opacity:0, width:'100%', height:'100%', cursor:'pointer'
                }}
              />
              <span style={{ marginLeft: 10, fontSize: 12, color: '#94a3b8' }}>
                {selectedFile ? selectedFile.name.substring(0, 15)+"..." : ""}
              </span>
            </div>

            <button className="btn-primary" onClick={handleCreatePost} disabled={txLoading}>
              <IconUpload /> Posting
            </button>
          </div>
        </div>
      </div>

      {/* 3. GRID GALLERY */}
      <h3 className="section-title" style={{borderBottom:'none', marginBottom: 12}}>
        Galeri ({myPosts.length})
      </h3>

      {myPosts.length === 0 ? (
        <p className="text-center text-muted" style={{padding: 40}}>Belum ada postingan.</p>
      ) : (
        <div className="gallery-grid">
          {myPosts.map((post) => (
            <div className="gallery-square" key={post.id}>
              {post.imageUrl ? (
                <img src={post.imageUrl} alt="My Post" />
              ) : (
                <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <IconImage />
                </div>
              )}
              {/* Overlay info */}
              <div className="gallery-overlay">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;