"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { GenerateResponse, Outlet, HistoryEntry } from "@/lib/types";
import TitleCard from "@/components/TitleCard";
import OutletSelector from "@/components/OutletSelector";
import HistoryPanel from "@/components/HistoryPanel";

const HISTORY_KEY = "dm_history";

function saveToHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  const raw = localStorage.getItem(HISTORY_KEY);
  const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];
  const newEntry: HistoryEntry = { ...entry, id: crypto.randomUUID(), timestamp: Date.now() };
  history.unshift(newEntry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
}

export default function GeneratorPage() {
  const router = useRouter();
  const [h1, setH1] = useState("");
  const [occhiello, setOcchiello] = useState("");
  const [outlet, setOutlet] = useState<Outlet>("TGCOM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!h1.trim() || !occhiello.trim()) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ h1, occhiello, outlet }),
      });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore generazione");
      setResult(data);
      saveToHistory({ h1, occhiello, outlet, precise: data.precise.text, bold: data.bold.text });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, [h1, occhiello, outlet, router]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Discover Matrix</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => setHistoryOpen(true)}
            style={navBtn}
          >
            Cronologia
          </button>
          <button onClick={handleLogout} style={{ ...navBtn, color: "var(--text-muted)" }}>
            Esci
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Outlet selector */}
        <OutletSelector value={outlet} onChange={setOutlet} />

        {/* Input fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field
            label="Occhiello"
            hint="Sottotitolo / anteprima — usato come contesto semantico"
            value={occhiello}
            onChange={setOcchiello}
            onKeyDown={handleKeyDown}
            placeholder="Es: A 90 anni l'attrice premio Oscar ha parlato apertamente della malattia..."
            rows={2}
          />
          <Field
            label="H1 originale"
            hint="Titolo principale — base da riscrivere"
            value={h1}
            onChange={setH1}
            onKeyDown={handleKeyDown}
            placeholder="Es: Il dramma di Judi Dench: «Non posso più vedere né riconoscere i miei amici»"
            rows={2}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !h1.trim() || !occhiello.trim()}
          style={{
            padding: "0.85rem 2rem",
            background: loading || !h1.trim() || !occhiello.trim() ? "var(--border)" : "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: loading || !h1.trim() || !occhiello.trim() ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            alignSelf: "flex-start",
          }}
        >
          {loading ? "Generazione in corso..." : "Genera titoli  ⌘↵"}
        </button>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "#3a1a1a",
              border: "1px solid var(--danger)",
              borderRadius: "8px",
              color: "var(--danger)",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Skeleton label="PRECISO" color="var(--precise)" />
            <Skeleton label="AUDACE" color="var(--bold)" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TitleCard data={result.precise} />
            <TitleCard data={result.bold} />
          </div>
        )}
      </main>

      {historyOpen && <HistoryPanel onClose={() => setHistoryOpen(false)} />}
    </div>
  );
}

/* ---- Sub-components ---- */

function Field({
  label, hint, value, onChange, onKeyDown, placeholder, rows,
}: {
  label: string; hint: string; value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string; rows: number;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.35rem" }}>
        <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label}</label>
        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{hint}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          padding: "0.7rem 0.9rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: "0.9rem",
          resize: "vertical",
          outline: "none",
          lineHeight: 1.5,
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function Skeleton({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        padding: "1.25rem",
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderRadius: "12px",
      }}
    >
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color, marginBottom: "0.75rem", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div
        style={{
          height: "1.2rem",
          background: "var(--surface-2)",
          borderRadius: "4px",
          width: "85%",
          animation: "pulse 1.5s infinite",
        }}
      />
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
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
