"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { HistoryRow } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [entries, setEntries] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [projectName, setProjectName] = useState(slug);

  useEffect(() => {
    Promise.all([
      fetch(`/api/history/${slug}`).then((r) => { if (r.status === 401) router.push(`/${slug}`); return r.json(); }),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([history, projects]) => {
      setEntries(Array.isArray(history) ? history : []);
      const p = projects.find((p: { slug: string; name: string }) => p.slug === slug);
      if (p) setProjectName(p.name);
    }).finally(() => setLoading(false));
  }, [slug, router]);

  const filtered = entries.filter((e) =>
    e.h1.toLowerCase().includes(search.toLowerCase()) ||
    e.precise_title.toLowerCase().includes(search.toLowerCase()) ||
    e.bold_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.push(`/${slug}/generator`)} style={ghostBtn}>← Generator</button>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{projectName} — Cronologia</span>
        </div>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "1.5rem" }}>
        {entries.length > 0 && (
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca nei titoli..." style={{ width: "100%", padding: "0.65rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "0.875rem", marginBottom: "1.25rem", outline: "none", fontFamily: "inherit" }} />
        )}

        {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Caricamento...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "4rem 0" }}>
            {search ? "Nessun risultato." : "Nessuna generazione ancora."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((entry) => <HistoryCard key={entry.id} entry={entry} />)}
        </div>
      </main>
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryRow }) {
  const date = new Date(entry.created_at).toLocaleString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>{date}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "0.75rem", lineHeight: 1.4 }}>{entry.h1}</div>
      <CopyRow label="PROTAGONISTA" text={entry.precise_title} color="var(--precise)" />
      <div style={{ height: "0.5rem" }} />
      <CopyRow label="RIVELAZIONE" text={entry.bold_title} color="var(--bold)" />
    </div>
  );
}

function CopyRow({ label, text, color }: { label: string; text: string; color: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 800, color, paddingTop: "2px", minWidth: "80px", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", flex: 1, lineHeight: 1.45 }}>{text}</span>
      <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: copied ? "var(--ok)" : "var(--text-muted)", flexShrink: 0, padding: "0 4px", fontFamily: "inherit" }}>
        {copied ? "✓" : "⎘"}
      </button>
    </div>
  );
}

const ghostBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: "7px", padding: "0.35rem 0.85rem", color: "var(--text)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" };
