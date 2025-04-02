"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">爆サイスーパービューア</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="爆サイスレッドのURLを貼ってください"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleLoad} disabled={loading}>
          {loading ? "読み込み中..." : "読み込む"}
        </Button>
      </div>
      {title && <h2 className="text-lg font-semibold mb-2">🧵 {title}</h2>}
      {posts.map((post, idx) => (
        <Card key={idx} className="mb-2">
          <CardContent className="text-sm p-3">
            <div className="text-gray-500 text-xs mb-1">
              {post.num} {post.date}
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.msg }} />
          </CardContent>
        </Card>
      ))}
      {posts.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          ✅ {posts.length} 件のレスを読み込みました
        </p>
      )}
    </div>
  );
}
