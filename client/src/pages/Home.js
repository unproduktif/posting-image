import React, { useState, useEffect } from "react";

function Home({ account, contract }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txLoadingId, setTxLoadingId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [error, setError] = useState("");

  const loadPosts = async () => {
    if (!contract) return;
    setLoading(true);
    setError("");

    try {
      const total = await contract.totalPosts();
      const totalNum = Number(total);
      const loaded = [];

      // ambil post dari yang terbaru (id paling besar)
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const handleLike = async (id) => {
    if (!contract) return;
    try {
      setTxLoadingId(id);
      const tx = await contract.likePost(id);
      await tx.wait();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p
        )
      );
    } catch (e) {
      console.error(e);
      alert("Gagal like post.");
    } finally {
      setTxLoadingId(null);
    }
  };

  const handleComment = async (id) => {
    if (!contract) return;

    const text = commentText[id]?.trim();
    if (!text) return;

    try {
      setTxLoadingId(id);
      const tx = await contract.addComment(id, text);
      await tx.wait();

      setCommentText((prev) => ({ ...prev, [id]: "" }));
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

  const formatAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    return d.toLocaleString();
  };

  if (!contract) {
    return (
      <div className="card">
        <p>Menghubungkan ke smart contract...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">Feed Terbaru</h2>

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <button className="btn-secondary" onClick={loadPosts} disabled={loading}>
          {loading ? "Memuat..." : "Refresh Feed"}
        </button>
      </div>

      {error && <p className="no-content-message">{error}</p>}

      {posts.length === 0 && !loading && (
        <p className="no-content-message">Belum ada postingan di blockchain.</p>
      )}

      {posts.map((post) => (
        <div className="card" key={post.id}>
          <div className="post-header">
            <div className="avatar">
              {(post.username || post.author || "U")
                .substring(2, 4)
                .toUpperCase()}
            </div>
            <div>
              <div className="post-author">
                {post.username || "Anon"} · {formatAddress(post.author)}
              </div>
              <div style={{ fontSize: 12, color: "#a0a0a5" }}>
                {formatTime(post.timestamp)}
              </div>
            </div>
          </div>

          {post.imageUrl ? (
            <div className="post-image-placeholder">
              <img
                src={post.imageUrl}
                alt="Post"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
            </div>
          ) : (
            <div className="post-image-placeholder">
              <span>Gambar belum diatur</span>
            </div>
          )}

          <p className="post-description">{post.description}</p>

          <div className="post-actions">
            <button
              className="btn-secondary"
              onClick={() => handleLike(post.id)}
              disabled={txLoadingId === post.id}
            >
              ❤️ Like ({post.likes})
              {txLoadingId === post.id && " ..."}
            </button>
            <span style={{ fontSize: 14, color: "#a0a0a5" }}>
              {post.commentCount} komentar
            </span>
          </div>

          <div className="comment-input-area">
            <input
              type="text"
              placeholder="Tambahkan komentar (on-chain)..."
              value={commentText[post.id] || ""}
              onChange={(e) =>
                setCommentText((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
            />
            <button
              className="btn-primary"
              onClick={() => handleComment(post.id)}
              disabled={txLoadingId === post.id}
            >
              Kirim
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
