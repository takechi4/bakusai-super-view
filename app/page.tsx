"use client";

import { useState } from "react";

export default function BakusaiViewer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");

  async function fetchAllPages(threadUrl) {
    const tidMatch = threadUrl.match(/tid=(\d+)/);
    if (!tidMatch) return alert("URLにtid=が含まれていません。");
    const tid = tidMatch[1];

    const allPosts = [];
    let found = false;
    for (let tp = 50; tp >= 1; tp--) {
      const pageUrl = `https://bakusai.com/thr_res/?tid=${tid}&tp=${tp}`;
      const res = await fetch(pageUrl);
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      if (!found) {
        const titleEl = doc.querySelector(".threadTitle, .title, h1");
        if (titleEl) setTitle(titleEl.textContent.trim());
        found = true;
      }

      const resAreas = doc.querySelectorAll(".resArea");
      if (resAreas.length === 0) break;

      resAreas.forEach((area) => {
        const num = area.querySelector(".resNo")?.textContent.trim() || "";
        const date = area.querySelector(".resDate")?.textContent.trim() || "";
        const msg = area.querySelector(".resMsg")?.innerHTML.trim() || "[本文なし]";
        allPosts.push({ num, date, msg });
      });
    }
    setPosts(allPosts.reverse());
  }

  const handleLoad = async () => {
    setLoading(true);
    setPosts([]);
    await fetchAllPages(url);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>爆サイスーパービューア</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="爆サイスレッドのURLを貼ってください"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button onClick={handleLoad} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          {loading ? "読み込み中..." : "読み込む"}
        </button>
      </div>
      {title && <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>🧵 {title}</h2>}
      {posts.map((post, idx) => (
        <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
            {post.num} {post.date}
          </div>
          <div style={{ fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: post.msg }} />
        </div>
      ))}
      {posts.length > 0 && (
        <p style={{ textAlign: 'center', color: 'gray', marginTop: '1rem' }}>
          ✅ {posts.length} 件のレスを読み込みました
        </p>
      )}
    </div>
  );
}
