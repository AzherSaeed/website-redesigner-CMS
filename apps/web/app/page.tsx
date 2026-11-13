"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API ?? "http://localhost:4000";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const { jobId } = await res.json();
    router.push(`/preview/${jobId}`);
  }

  return (
    <main style={{ maxWidth: 640, margin: "10vh auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Website Redesigner</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Paste a URL. Get a redesigned Next.js landing page.</p>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input
          type="url"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", fontSize: 16, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "12px 20px", fontSize: 16, borderRadius: 8, border: 0, background: "#111", color: "#fff" }}
        >
          {loading ? "…" : "Redesign"}
        </button>
      </form>
    </main>
  );
}
