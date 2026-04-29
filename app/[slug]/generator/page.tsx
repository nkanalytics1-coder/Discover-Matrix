"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { GenerateResponse, UsageStats } from "@/lib/types";
import TitleCard from "@/components/TitleCard";
import HistoryPanel from "@/components/HistoryPanel";

export default function GeneratorPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [projectName, setProjectName] = useState("");
  const [h1, setH1] = useState("");
  const [occhiello, setOcchiello] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((projects: { name: string; slug: string }[]) => {
        const p = projects.find((p) => p.slug === slug);
        if (p) setProjectName(p.name);
      });
  }, [slug]);

  const handleGenerate = useCallback(async () => {
    if (!h1.trim() || !occhiello.trim()) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ h1, occhiello, slug }),
      });
      if (res.status === 401) { router.push(`/${slug}`); return; }
      const data = await res.json();
      if (res.status === 429) {
        setError(`${data.error} (${data.usage?.today ?? "?"}/${data.usage?.daily_limit ?? "?"} oggi)`);
        setUsage(data.usage);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Errore generazione");
      setResult(data);
      setUsage(data.usage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, [h1, occhiello, slug, router]);

  async function handleLogout() {
    await fetch(`/api/auth/${slug}`, { method: "DELETE" });
    router.push(`/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
  }

  const canGenerate = !loading && h1.trim() && occhiello.trim();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.1rem", cursor: "pointer", padding: "0 4px" }} title="Home">⚡</button>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{projectName || slug}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {usage && <UsageBadge usage={usage} />}
          <button onClick={() => setHistoryOpen(true)} style={navBtn}>Cronologia</button>
          <button onClick={handleLogout} style={{ ...navBtn, color: "var(--text-muted)" }}>Esci</button>
        </div>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <InputField label="Occhiello" hint="Contesto semantico dell'articolo" value={occhiello} onChange={setOcchiello} onKeyDown={handleKeyDown} placeholder="Es: A 90 anni l'attrice premio Oscar ha parlato apertamente della malattia che la sta privando della vista..." rows={2} />
          <InputField label="H1 originale" hint="Base da riscrivere" value={h1} onChange={setH1} onKeyDown={handleKeyDown} placeholder="Es: Il dramma di Judi Dench: «Non posso più vedere né riconoscere i miei amici»" rows={2} />
        </div>

        <button onClick={handleGenerate} disabled={!canGenerate} style={{ padding: "0.8rem 1.75rem", background: canGenerate ? "var(--accent)" : "#c8ccdc", color: canGenerate ? "#fff" : "var(--text-muted)", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", cursor: canGenerate ? "pointer" : "not-allowed", alignSelf: "flex-start", fontFamily: "inherit" }}>
          {loading ? "Generazione in corso..." : "Genera titoli  ⌘↵"}
        </button>

        {error && <div style={{ padding: "0.75rem 1rem", background: "var(--danger-light)", border: "1px solid #fca5a5", borderRadius: "8px", color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Skeleton label="PROTAGONISTA" color="var(--precise)" />
            <Skeleton label="RIVELAZIONE" color="var(--bold)" />
          </div>
        )}

        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TitleCard data={result.precise} outlet={projectName} />
            <TitleCard data={result.bold} outlet={projectName} />
          </div>
        )}
      </main>

      {historyOpen && <HistoryPanel slug={slug} projectName={projectName} onClose={() => setHistoryOpen(false)} />}
    </div>
  );
}

function UsageBadge({ usage }: { usage: UsageStats }) {
  const dayPct = Math.round((usage.today / usage.daily_limit) * 100);
  const color = dayPct >= 100 ? "var(--danger)" : dayPct >= 80 ? "var(--warn)" : "var(--ok)";
  return (
    <div style={{ fontSize: "0.72rem", color, fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "99px", padding: "3px 10px" }}>
      {usage.today}/{usage.daily_limit} oggi · {usage.month}/{usage.monthly_limit} mese
    </div>
  );
}

function InputField({ label, hint, value, onChange, onKeyDown, placeholder, rows }: { label: string; hint: string; value: string; onChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent) => void; placeholder: string; rows: number }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginBottom: "0.3rem" }}>
        <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label}</label>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{hint}</span>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={rows} style={{ width: "100%", padding: "0.65rem 0.9rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "0.9rem", resize: "vertical", outline: "none", lineHeight: 1.5, fontFamily: "inherit" }} />
    </div>
  );
}

function Skeleton({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ padding: "1.25rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, color, marginBottom: "0.75rem", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ height: "1.1rem", background: "var(--surface-2)", borderRadius: "4px", width: "80%", animation: "pulse 1.4s ease-in-out infinite" }} />
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

const navBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: "7px", padding: "0.35rem 0.85rem", color: "var(--text)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" };
