"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface ProjectInfo { name: string; slug: string; homepage_url: string; }

export default function ProjectLoginPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((projects: ProjectInfo[]) => {
        const p = projects.find((p) => p.slug === slug);
        if (p) setProject(p); else setNotFound(true);
      });
  }, [slug]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/auth/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      router.push(`/${slug}/generator`);
    } else {
      const data = await res.json();
      setError(data.error || "Codice non valido");
      setLoading(false);
    }
  }

  if (notFound) return (
    <Center>
      <p style={{ color: "var(--text-muted)" }}>Progetto <strong>{slug}</strong> non trovato.</p>
      <button onClick={() => router.push("/")} style={ghostBtn}>← Torna alla home</button>
    </Center>
  );

  if (!project) return <Center><p style={{ color: "var(--text-muted)" }}>Caricamento...</p></Center>;

  return (
    <Center>
      <div style={{ width: "100%", maxWidth: "360px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2.5rem 2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>{project.name}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>Discover Matrix</p>
        </div>
        <form onSubmit={handleLogin}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.4rem" }}>Codice di accesso</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••••"
            autoFocus
            style={{ width: "100%", padding: "0.65rem 0.9rem", background: "var(--surface-2)", border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`, borderRadius: "8px", color: "var(--text)", fontSize: "1rem", outline: "none", marginBottom: "0.75rem", fontFamily: "inherit" }}
          />
          {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginBottom: "0.75rem", marginTop: "-0.4rem" }}>{error}</p>}
          <button type="submit" disabled={loading || !code} style={{ width: "100%", padding: "0.7rem", background: loading || !code ? "#c8ccdc" : "var(--accent)", color: loading || !code ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem", cursor: loading || !code ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer" }}>← Tutti i progetti</button>
        </div>
      </div>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "var(--bg)", gap: "1rem" }}>{children}</div>;
}
const ghostBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: "7px", padding: "0.5rem 1rem", color: "var(--text)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" };
