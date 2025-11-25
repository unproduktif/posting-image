import React, { useState, useEffect } from "react";

function Profile({ account, contract }) {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [postDescription, setPostDescription] = useState("");

  const [myPosts, setMyPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  const loadProfile = async () => {
    if (!contract || !account) return;
    setLoadingProfile(true);
    try {
      const name = await contract.usernames(account);
      if (name && name.length > 0) {
        setUsername(name);
      } else {
        setUsername("Pengguna MetaSnap");
      }
    } catch (e) {
      console.error(e);
      setUsername("Pengguna MetaSnap");
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
          description: p[3],
          likes: Number(p[4]),
          timestamp: Number(p[5]),
          commentCount: Number(p[6]),
        });
      }

      setMyPosts(mine);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
    loadMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account]);

  const handleUpdateName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) return alert("Nama tidak boleh kosong.");
    if (!contract) return alert("Contract belum siap.");

    try {
      setTxLoading(true);
      const tx = await contract.setUsername(trimmed);
      await tx.wait();
      setUsername(trimmed);
      setTempName("");
      alert("Username berhasil disimpan ke blockchain.");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan username.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleCreatePost = async () => {
    const desc = postDescription.trim();
    const img = imageUrl.trim();
    if (!desc || !img) {
      return alert("Isi URL gambar dan deskripsi.");
    }
    if (!contract) return alert("Contract belum siap.");

    try {
      setTxLoading(true);
      const tx = await contract.createPost(img, desc);
      await tx.wait();

      setPostDescription("");
      setImageUrl("");
      await loadMyPosts();

      alert("Post berhasil disimpan ke blockchain.");
    } catch (e) {
      console.error(e);
      alert("Gagal membuat post.");
    } finally {
      setTxLoading(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    return d.toLocaleString();
  };

  if (!contract) {
    return (
      <div className="card">
        <p>Menyiapkan koneksi ke smart contract...</p>
      </div>
    );
  }

  return (
    <div>
      {/* PROFILE HEADER */}
      <div className="card profile-header">
        <div className="profile-avatar">
          {(username || "U").charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-username">
          {loadingProfile ? "Memuat..." : username || "Pengguna MetaSnap"}
        </h2>
        <p className="profile-wallet-address">{account}</p>

        <div className="profile-edit-name-section">
          <input
            type="text"
            placeholder="Ganti nama pengguna..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={handleUpdateName}
            disabled={txLoading}
          >
            Simpan
          </button>
        </div>
      </div>

      {/* CREATE POST */}
      <div className="card" style={{ marginBottom: "var(--spacing-unit) * 2" }}>
        <h3 className="section-title" style={{ marginTop: 0 }}>
          Buat Postingan Baru
        </h3>

        <div className="input-group">
          <label>URL Gambar (IPFS / HTTPS)</label>
          <input
            type="text"
            placeholder="contoh: https://gateway.pinata.cloud/ipfs/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Deskripsi</label>
          <textarea
            rows="4"
            placeholder="Tuliskan deskripsi postingan Anda..."
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
          ></textarea>
        </div>

        <button
          className="btn-primary"
          onClick={handleCreatePost}
          style={{ width: "100%" }}
          disabled={txLoading}
        >
          {txLoading ? "Mengirim transaksi..." : "Upload ke Blockchain"}
        </button>
      </div>

      {/* MY POSTS */}
      <h3 className="section-title">Postingan Saya</h3>

      {myPosts.length === 0 ? (
        <p className="no-content-message">Anda belum memposting apapun.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--spacing-unit)",
          }}
        >
          {myPosts.map((post) => (
            <div
              className="card"
              key={post.id}
              style={{ padding: "var(--spacing-unit)" }}
            >
              <div
                className="post-image-placeholder"
                style={{ height: "180px", marginBottom: 12 }}
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt="My Post"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      borderRadius: 12,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span>Gambar tidak tersedia</span>
                )}
              </div>
              <p className="post-description">{post.description}</p>
              <div
                style={{
                  fontSize: 13,
                  color: "#a0a0a5",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>❤️ {post.likes} like</span>
                <span>{post.commentCount} komentar</span>
                <span>{formatTime(post.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
