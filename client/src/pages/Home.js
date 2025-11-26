// client/src/pages/Home.js
import React, { useEffect, useState, useCallback } from "react";

function Home({ account, contract, loadingContract }) {
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [txLoadingId, setTxLoadingId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");

  /* -----------------------------
        LOAD ALL POSTS
  ------------------------------ */
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
      setError("Gagal memuat postingan dari blockchain.");
    } finally {
      setLoadingFeed(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) loadPosts();
  }, [contract, loadPosts]);


  /* -----------------------------
        LOAD COMMENTS PER POST
  ------------------------------ */
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

      setComments((prev) => ({
        ...prev,
        [postId]: arr,
      }));
    } catch (err) {
      console.error("Gagal load komentar:", err);
    }
  };

  /* -----------------------------
        LIKE POST
  ------------------------------ */
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

  /* -----------------------------
        SUBMIT COMMENT
  ------------------------------ */
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


  /* -----------------------------
        UTIL
  ------------------------------ */
  const formatAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleString();
  };


  /* -----------------------------
        UI STATE
  ------------------------------ */
  if (loadingContract && !contract) {
    return (
      <div className="card">
        <p>Menghubungkan ke smart contract…</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="card">
        <p>Contract belum siap. Coba connect wallet dulu.</p>
      </div>
    );
  }


  /* -----------------------------
        RENDER FEED
  ------------------------------ */
  return (
    <div>
      <h2 className="section-title">✨ Feed MetaSnap</h2>

      <div style={{ marginBottom: 20, textAlign: "right" }}>
        <button
          className="btn-secondary"
          onClick={loadPosts}
          disabled={loadingFeed}
          style={{ borderRadius: 12 }}
        >
          {loadingFeed ? "Memuat..." : "Refresh 🔄"}
        </button>
      </div>

      {error && <p className="no-content-message">{error}</p>}

      {!loadingFeed && posts.length === 0 && (
        <p className="no-content-message">Belum ada postingan di blockchain.</p>
      )}

      {/* Loop all posts */}
      {posts.map((post) => (
        <div className="card" key={post.id} style={{ paddingBottom: 18 }}>

          {/* HEADER */}
          <div className="post-header">
            <div
              className="avatar"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                color: "white",
              }}
            >
              {(post.username || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="post-author">
                {post.username || "Anon"} · {formatAddress(post.author)}
              </div>
              <div style={{ fontSize: 12, color: "#b5b5b5" }}>
                {formatTime(post.timestamp)}
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="post-image-placeholder" style={{ overflow: "hidden" }}>
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post"
                style={{
                  width: "100%",
                  maxHeight: 380,
                  objectFit: "cover",
                }}
              />
            ) : (
              <span>Gambar tidak tersedia</span>
            )}
          </div>

          {/* DESCRIPTION */}
          <p className="post-description">{post.description}</p>

          {/* ACTIONS */}
          <div className="post-actions">
            <button
              className="btn-secondary"
              onClick={() => handleLike(post.id)}
              disabled={txLoadingId === post.id}
              style={{
                background: "linear-gradient(135deg, #ec4899, #d946ef)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "8px 16px",
                fontWeight: 600,
              }}
            >
              ❤️ Like ({post.likes})
              {txLoadingId === post.id && "..."}
            </button>

            <span style={{ fontSize: 14, color: "#c5c5c5" }}>
              {post.commentCount} komentar
            </span>

            <button
              className="btn-secondary"
              onClick={() => loadComments(post.id)}
              style={{
                marginLeft: "auto",
                padding: "6px 14px",
                borderRadius: 10,
              }}
            >
              Lihat Komentar ⬇️
            </button>
          </div>

          {/* COMMENT INPUT */}
          <div className="comment-input-area">
            <input
              type="text"
              placeholder="Tulis komentar..."
              value={commentText[post.id] || ""}
              onChange={(e) =>
                setCommentText((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
              style={{
                flexGrow: 1,
                borderRadius: 12,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
            />

            <button
              className="btn-primary"
              onClick={() => handleComment(post.id)}
              disabled={txLoadingId === post.id}
              style={{ borderRadius: 12 }}
            >
              Kirim
            </button>
          </div>

          {/* COMMENT LIST */}
          {comments[post.id] && comments[post.id].length > 0 && (
            <div className="comment-list">
              {comments[post.id].map((c, idx) => (
                <div key={idx} className="comment-item">
                  <strong>
                    {c.author.substring(0, 6)}...
                    {c.author.substring(c.author.length - 4)}
                  </strong>{" "}
                  •{" "}
                  <span style={{ opacity: 0.7, fontSize: 13 }}>
                    {new Date(c.timestamp * 1000).toLocaleString()}
                  </span>

                  <div style={{ marginTop: 6 }}>{c.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Home;
