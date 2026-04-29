"use client";
import { useEffect, useState } from "react";
import type { HistoryEntry } from "@/lib/types";

const HISTORY_KEY = "dm_history";

interface Props {
  onClose: () => void;
}

export default function HistoryPanel({ onClose }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  const filtered = entries.filter(
    (e) =>
      e.h1.toLowerCase().includes(search.toLowerCase()) ||
      e.precise.toLowerCase().includes(search.toLowerCase()) ||
      e.bold.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40,
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(520px, 92vw)",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700 }}>Cronologia ({entries.length})</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        {entries.length > 0 && (
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca..."
              autoFocus
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "7px",
                color: "var(--text)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Entries */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 1.25rem" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: "3rem", fontSize: "0.875rem" }}>
              {search ? "Nessun risultato." : "Nessuna generazione ancora."}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map((entry) => (
              <PanelEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function PanelEntry({ entry }: { entry: HistoryEntry }) {
  const date = new Date(entry.timestamp).toLocaleString("it-IT", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "0.9rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{date}</span>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)" }}>{entry.outlet}</span>
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>
        {entry.h1}
      </div>
      <CopyRow label="P" text={entry.precise} color="var(--precise)" />
      <CopyRow label="A" text={entry.bold} color="var(--bold)" />
    </div>
  );
}

function CopyRow({ label, text, color }: { label: string; text: string; color: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 800, color, paddingTop: "2px", minWidth: "12px" }}>{label}</span>
      <span style={{ fontSize: "0.8rem", flex: 1, lineHeight: 1.4 }}>{text}</span>
      <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: copied ? "var(--ok)" : "var(--text-muted)", flexShrink: 0, padding: "0 2px" }}>
        {copied ? "✓" : "⎘"}
      </button>
    </div>
  );
}
