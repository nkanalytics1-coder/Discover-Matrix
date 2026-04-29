"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HistoryEntry } from "@/lib/types";

const HISTORY_KEY = "dm_history";

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  function handleClear() {
    if (!confirm("Cancellare tutta la cronologia?")) return;
    localStorage.removeItem(HISTORY_KEY);
    setEntries([]);
  }

  const filtered = entries.filter(
    (e) =>
      e.h1.toLowerCase().includes(search.toLowerCase()) ||
      e.precise.toLowerCase().includes(search.toLowerCase()) ||
      e.bold.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.push("/generator")} style={navBtn}>← Torna</button>
          <span style={{ fontWeight: 700 }}>Cronologia</span>
        </div>
        {entries.length > 0 && (
          <button onClick={handleClear} style={{ ...navBtn, color: "var(--danger)" }}>
            Cancella tutto
          </button>
        )}
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "1.5rem" }}>
        {entries.length > 0 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca nella cronologia..."
            style={{
              width: "100%",
              padding: "0.65rem 1rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              outline: "none",
            }}
          />
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "4rem 0" }}>
            {search ? "Nessun risultato." : "Nessuna generazione ancora."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </main>
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const date = new Date(entry.timestamp).toLocaleString("it-IT", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{date}</span>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "var(--accent)",
            background: "rgba(99,102,241,0.12)",
            padding: "2px 8px",
            borderRadius: "99px",
          }}
        >
          {entry.outlet}
        </span>
      </div>

      <div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>H1 originale</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>{entry.h1}</div>
      </div>

      <HistoryTitle label="PRECISO" text={entry.precise} color="var(--precise)" />
      <HistoryTitle label="AUDACE" text={entry.bold} color="var(--bold)" />
    </div>
  );
}

function HistoryTitle({ label, text, color }: { label: string; text: string; color: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color, minWidth: "54px", paddingTop: "2px", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.875rem", flex: 1 }}>{text}</span>
      <button
        onClick={copy}
        title="Copia"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.85rem",
          opacity: 0.5,
          padding: "0 4px",
          flexShrink: 0,
        }}
      >
        {copied ? "✓" : "⎘"}
      </button>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  borderRadius: "7px",
  padding: "0.4rem 0.9rem",
  color: "var(--text)",
  fontSize: "0.85rem",
  cursor: "pointer",
};
