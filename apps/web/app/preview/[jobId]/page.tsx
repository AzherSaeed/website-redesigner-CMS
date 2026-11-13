"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API ?? "http://localhost:4000";

export default function Preview({ params }: { params: { jobId: string } }) {
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      while (!cancelled) {
        const r = await fetch(`${API}/jobs/${params.jobId}`).then((r) => r.json());
        setStatus(r.status);
        if (r.status === "error") {
          setError(r.error ?? "Unknown error");
          return;
        }
        if (r.status === "done") {
          setReady(true);
          return;
        }
        await new Promise((res) => setTimeout(res, 1500));
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [params.jobId]);

  if (error) {
    return (
      <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ color: "#b00" }}>Pipeline failed at &ldquo;{status}&rdquo;</h2>
        <pre
          style={{
            background: "#fff5f5",
            border: "1px solid #f3c",
            padding: 16,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            fontSize: 13,
          }}
        >
          {error}
        </pre>
      </main>
    );
  }

  if (!ready) {
    return (
      <main style={{ padding: 40 }}>
        <p style={{ fontSize: 16 }}>Status: {status}…</p>
      </main>
    );
  }

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid #eee",
          background: "#fafafa",
        }}
      >
        <div style={{ fontSize: 14, color: "#666" }}>Live preview</div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`${API}/rendered/${params.jobId}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "8px 14px",
              border: "1px solid #ddd",
              borderRadius: 8,
              color: "#333",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Open in new tab
          </a>
          <a
            href={`${API}/export/${params.jobId}`}
            style={{
              padding: "8px 14px",
              background: "#111",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Download ZIP
          </a>
        </div>
      </div>
      <iframe
        src={`${API}/rendered/${params.jobId}`}
        style={{ flex: 1, width: "100%", border: 0, background: "#fff" }}
        title="Generated landing page"
      />
    </main>
  );
}
