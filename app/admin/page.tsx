"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectWithUsage } from "@/lib/types";

type SafeProject = Omit<ProjectWithUsage, "secret_code">;

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SafeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDaily, setEditDaily] = useState(0);
  const [editMonthly, setEditMonthly] = useState(0);

  async function load() {
    const res = await fetch("/api/admin/projects");
    if (res.status === 401) { router.push("/admin/login"); return; }
    setProjects(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminare il progetto "${name}"? L'operazione è irreversibile.`)) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function startEdit(p: SafeProject) {
    setEditingId(p.id);
    setEditDaily(p.daily_limit);
    setEditMonthly(p.monthly_limit);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daily_limit: editDaily, monthly_limit: editMonthly }),
    });
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, daily_limit: editDaily, monthly_limit: editMonthly } : p));
    setEditingId(null);
  }

  async function handleLogout() {
    await fetch("/api/admin", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.push("/")} style={ghostBtn}>← Home</button>
          <span style={{ fontWeight: 700 }}>Admin panel</span>
        </div>
        <button onClick={handleLogout} style={{ ...ghostBtn, color: "var(--text-muted)" }}>Esci</button>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Caricamento...</p>
        ) : projects.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Nessun progetto.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {projects.map((p) => (
              <div key={p.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{p.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      /{p.slug} · <a href={p.homepage_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>{p.homepage_url}</a>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Creato: {new Date(p.created_at).toLocaleDateString("it-IT")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button onClick={() => startEdit(p)} style={smallBtn}>Limiti</button>
                    <button onClick={() => handleDelete(p.id, p.name)} style={{ ...smallBtn, color: "var(--danger)", borderColor: "#fca5a5" }}>Elimina</button>
                  </div>
                </div>

                {/* Usage */}
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
                  <Stat label="Oggi" value={p.today_usage} limit={p.daily_limit} />
                  <Stat label="Questo mese" value={p.month_usage} limit={p.monthly_limit} />
                </div>

                {/* Inline limits editor */}
                {editingId === p.id && (
                  <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface-2)", borderRadius: "8px", display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <LimitInput label="Limite/giorno" value={editDaily} onChange={setEditDaily} />
                    <LimitInput label="Limite/mese" value={editMonthly} onChange={setEditMonthly} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => saveEdit(p.id)} style={primaryBtn}>Salva</button>
                      <button onClick={() => setEditingId(null)} style={ghostBtn}>Annulla</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, limit }: { label: string; value: number; limit: number }) {
  const pct = Math.round((value / limit) * 100);
  const color = pct >= 100 ? "var(--danger)" : pct >= 80 ? "var(--warn)" : "var(--ok)";
  return (
    <div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600, color }}>{value}<span style={{ color: "var(--text-muted)", fontWeight: 300 }}>/{limit}</span></div>
    </div>
  );
}

function LimitInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "4px", fontWeight: 600 }}>{label}</label>
      <input type="number" min={1} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "80px", padding: "0.45rem 0.6rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }} />
    </div>
  );
}

const primaryBtn: React.CSSProperties = { background: "var(--accent)", color: "#fff", border: "none", borderRadius: "7px", padding: "0.5rem 1rem", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" };
const ghostBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: "7px", padding: "0.4rem 0.85rem", color: "var(--text)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" };
const smallBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.3rem 0.7rem", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit", color: "var(--text)" };
