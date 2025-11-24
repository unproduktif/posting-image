import React, { useState } from 'react';

function Profile({ account }) {
  const [username, setUsername] = useState("Pengguna Blockchain");
  const [tempName, setTempName] = useState("");

  const [postDescription, setPostDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [myPosts, setMyPosts] = useState([]); // Dummy for user's own posts

  const handleUpdateName = () => {
    if (!tempName) return alert("Nama tidak boleh kosong!");
    setUsername(tempName);
    alert(`Nama profil berhasil diubah menjadi "${tempName}". (Akan disimpan di Blockchain)`);
    setTempName('');
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadPost = () => {
    if (!selectedFile || !postDescription) {
      return alert("Pilih gambar dan isi deskripsi!");
    }
    alert(`Mengupload "${postDescription}" dengan gambar ${selectedFile.name}. (Proses ke IPFS & Blockchain)`);
    setPostDescription("");
    setSelectedFile(null);
    // Add to dummy posts for immediate display
    setMyPosts(prev => [...prev, { id: prev.length + 1, content: postDescription, imageUrl: "dummy_url" }]);
  };

  return (
    <div>
      {/* SECTION PROFIL */}
      <div className="card profile-header">
        <div className="profile-avatar">{username.substring(0,1).toUpperCase()}</div>
        <h2 className="profile-username">{username}</h2>
        <p className="profile-wallet-address">{account}</p>

        <div className="profile-edit-name-section">
          <input
            type="text"
            placeholder="Ganti nama pengguna..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
          <button className="btn-primary" onClick={handleUpdateName}>Simpan</button>
        </div>
      </div>

      {/* SECTION UPLOAD POST */}
      <div className="card" style={{marginBottom: 'var(--spacing-unit) * 2'}}>
        <h3 className="section-title" style={{marginTop:'0'}}>Buat Postingan Baru</h3>
        <div className="input-group">
          <label htmlFor="file-upload">Pilih Gambar</label>
          <input id="file-upload" type="file" onChange={handleFileChange} />
        </div>
        <div className="input-group">
          <textarea
            rows="4"
            placeholder="Tuliskan deskripsi postingan Anda..."
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
          ></textarea>
        </div>
        <button className="btn-primary" onClick={handleUploadPost} style={{width:'100%'}}>Upload ke Blockchain</button>
      </div>

      {/* SECTION POSTINGAN SAYA */}
      <h3 className="section-title">Postingan Saya</h3>
      {myPosts.length === 0 ? (
        <p className="no-content-message">Anda belum memposting apapun.</p>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-unit)'}}>
            {myPosts.map((post) => (
                <div className="card" key={post.id} style={{padding: 'var(--spacing-unit)', textAlign: 'center'}}>
                    <div className="post-image-placeholder" style={{height: '150px'}}>
                        <span>Gambar Anda</span>
                    </div>
                    <p style={{fontSize: '15px', color: 'var(--text-color-primary)'}}>{post.content}</p>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default Profile;