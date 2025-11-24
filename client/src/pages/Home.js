import React, { useState } from 'react';

function Home({ account }) {
  // DATA PURA-PURA (Nanti ini diganti data dari Blockchain)
  const [posts, setPosts] = useState([
    { id: 1, author: '0x123abc456def', content: 'Nikmati pengalaman sosial terdesentralisasi yang mulus dengan BlockchainGram!', tips: '0.05', comments: ['Wow, UI-nya keren!', 'Sangat responsif!'] },
    { id: 2, author: '0x456def789abc', content: 'Berbagi momen berharga langsung di blockchain. Ini masa depan!', tips: '0.01', comments: ['Keren!', 'Pengembangan yang bagus.'] }
  ]);
  const [commentText, setCommentText] = useState({});

  const handleLike = (id) => {
    alert(`Anda akan memberikan Tip untuk Post ID: ${id}. (Akan muncul konfirmasi MetaMask)`);
  };

  const handleComment = (id) => {
    const text = commentText[id];
    if (!text) return;
    alert(`Komentar Anda: "${text}" di Post ID: ${id}. (Akan disimpan di Blockchain)`);
    setCommentText({...commentText, [id]: ''}); // Bersihkan input
  };

  return (
    <div>
      <h2 className="section-title">Feed Terbaru</h2>
      {posts.length === 0 ? (
        <p className="no-content-message">Belum ada postingan. Jadilah yang pertama!</p>
      ) : (
        posts.map((post) => (
          <div className="card" key={post.id}>
            <div className="post-header">
              <div className="avatar">{post.author.substring(2,4).toUpperCase()}</div>
              <span className="post-author">{post.author.substring(0,6)}...{post.author.substring(post.author.length-4)}</span>
            </div>

            <div className="post-image-placeholder">
              <span>Gambar Postingan dari IPFS</span>
            </div>

            <p className="post-description">{post.content}</p>

            <div className="post-actions">
              <button className="btn-secondary" onClick={() => handleLike(post.id)}>
                ❤️ Tip ({post.tips} ETH)
              </button>
            </div>

            <div className="comment-list">
              {post.comments.length > 0 ? (
                post.comments.map((c, idx) => (
                  <p key={idx} className="comment-item">
                    <span>Anon:</span> {c}
                  </p>
                ))
              ) : (
                <p className="comment-item">Belum ada komentar.</p>
              )}
            </div>

            <div className="comment-input-area">
              <input
                type="text"
                placeholder="Tambahkan komentar..."
                value={commentText[post.id] || ''}
                onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
              />
              <button className="btn-primary" onClick={() => handleComment(post.id)}>Kirim</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;