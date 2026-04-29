"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectCard {
  id: string; name: string; slug: string; homepage_url: string; created_at: string;
}

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Discover Matrix</span>
        </div>
        <button onClick={() => router.push("/admin/login")} style={ghostBtn}>Admin</button>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Progetti</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Seleziona un progetto o creane uno nuovo
            </p>
          </div>
          <button onClick={() => router.push("/new")} style={primaryBtn}>+ Nuovo progetto</button>
        </div>

        {loading && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Caricamento...</div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📰</div>
            <p style={{ marginBottom: "1rem" }}>Nessun progetto ancora.</p>
            <button onClick={() => router.push("/new")} style={primaryBtn}>Crea il primo progetto</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/${p.slug}`)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.25rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "box-shadow 0.15s, border-color 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(79,82,214,0.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
            >
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.35rem" }}>{p.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.homepage_url}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600 }}>Apri →</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px",
  padding: "0.55rem 1.1rem", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
};
const ghostBtn: React.CSSProperties = {
  background: "none", border: "1px solid var(--border)", borderRadius: "7px",
  padding: "0.4rem 0.9rem", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit",
};
