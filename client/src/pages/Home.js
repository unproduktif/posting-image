// client/src/pages/Home.js
import React, { useEffect, useState, useCallback } from "react";

// --- INLINE SVG ICONS (Tanpa Install) ---
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);
const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const IconMessage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const IconImage = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

function Home({ account, contract, loadingContract }) {
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [txLoadingId, setTxLoadingId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null); // Toggle komentar

  // --- LOGIC ---
  const loadPosts = useCallback(async () => {
    if (!contract) return;
    setLoadingFeed(true);
    setError("");

    try {
      const total = await contract.totalPosts();
      const totalNum = Number(total);
      const loaded = [];

      for (let i = totalNum - 1; i >= 0; i--) {
        const p = await contract.getPost(i);
        const author = p[1];
        let username = "";
        try {
          username = await contract.usernames(author);
        } catch (e) {
          console.error("Gagal ambil username:", e);
        }

        loaded.push({
          id: Number(p[0]),
          author,
          username,
          imageUrl: p[2],
          description: p[3],
          likes: Number(p[4]),
          timestamp: Number(p[5]),
          commentCount: Number(p[6]),
        });
      }
      setPosts(loaded);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat feed.");
    } finally {
      setLoadingFeed(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) loadPosts();
  }, [contract, loadPosts]);

  const loadComments = async (postId) => {
    if (!contract) return;
    try {
      const total = await contract.getCommentCount(postId);
      const count = Number(total);
      const arr = [];
      for (let i = 0; i < count; i++) {
        const c = await contract.getComment(postId, i);
        arr.push({
          author: c[0],
          text: c[1],
          timestamp: Number(c[2]),
        });
      }
      setComments((prev) => ({ ...prev, [postId]: arr }));
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  const toggleComments = (postId) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null);
    } else {
      setActiveCommentPost(postId);
      loadComments(postId);
    }
  };

  const handleLike = async (id) => {
    if (!contract) return alert("Contract belum siap.");
    try {
      setTxLoadingId(id);
      const tx = await contract.likePost(id);
      await tx.wait();
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Gagal memberikan like.");
    } finally {
      setTxLoadingId(null);
    }
  };

  const handleComment = async (id) => {
    if (!contract) return alert("Contract belum siap.");
    const text = (commentText[id] || "").trim();
    if (!text) return;

    try {
      setTxLoadingId(id);
      const tx = await contract.addComment(id, text);
      await tx.wait();
      setCommentText((prev) => ({ ...prev, [id]: "" }));
      await loadComments(id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, commentCount: p.commentCount + 1 } : p
        )
      );
    } catch (e) {
      console.error(e);
      alert("Gagal mengirim komentar.");
    } finally {
      setTxLoadingId(null);
    }
  };

  // Helper format
  const formatAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleDateString("id-ID", {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- RENDER ---
  if (loadingContract && !contract) {
    return <div className="card text-center"><p>Menghubungkan ke jaringan...</p></div>;
  }
  if (!contract) {
    return <div className="card text-center"><p>Wallet tidak terhubung.</p></div>;
  }

  return (
    <div>
      <div className="section-title">
        <h3>Beranda</h3>
        <button className="btn-secondary" onClick={loadPosts} disabled={loadingFeed}>
          <IconRefresh />
          {loadingFeed ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {error && <p className="text-center text-muted">{error}</p>}

      {!loadingFeed && posts.length === 0 && (
        <div className="card text-center text-muted" style={{padding: 40}}>
          Belum ada postingan.
        </div>
      )}

      {posts.map((post) => (
        <div className="card" key={post.id}>
          {/* HEADER (Baru & Rapi) */}
          <div className="post-header">
            <div className="avatar">
              {(post.username || "U").charAt(0).toUpperCase()}
            </div>
            
            <div className="post-meta-content">
              <div className="post-author-name">
                {post.username || "Anonymous"}
              </div>
              <div className="post-meta-details">
                {/* Badge Address */}
                <span className="badge-address">
                  {formatAddress(post.author)}
                </span>
                <span>•</span>
                <span>{formatTime(post.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="post-image-container">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post"
                style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
              />
            ) : (
              <div style={{ padding: 40 }}><IconImage /></div>
            )}
          </div>

          {/* TEXT */}
          <p className="post-description">{post.description}</p>

          {/* ACTIONS */}
          <div className="post-actions">
            <button
              className="btn-secondary"
              onClick={() => handleLike(post.id)}
              disabled={txLoadingId === post.id}
            >
              <IconHeart />
              <span>{post.likes} Like</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() => toggleComments(post.id)}
            >
              <IconMessage />
              <span>{post.commentCount} Komentar</span>
            </button>
          </div>

          {/* KOMENTAR */}
          {activeCommentPost === post.id && (
            <div className="comment-section">
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Tulis komentar..."
                  value={commentText[post.id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                />
                <button
                  className="btn-primary"
                  onClick={() => handleComment(post.id)}
                  disabled={txLoadingId === post.id}
                >
                  <IconSend />
                </button>
              </div>

              <div className="comment-list">
                {comments[post.id] && comments[post.id].length > 0 ? (
                  comments[post.id].map((c, idx) => (
                    <div key={idx} className="comment-item">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong style={{fontSize: 12}}>{formatAddress(c.author)}</strong>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {formatTime(c.timestamp)}
                        </span>
                      </div>
                      <div style={{ color: "#334155" }}>{c.text}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted" style={{fontSize: 13}}>Belum ada komentar.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Home;