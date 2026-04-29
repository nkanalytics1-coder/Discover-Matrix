"use client";
import { useState } from "react";
import type { GeneratedTitle } from "@/lib/types";
import CharCounter from "./CharCounter";
import DiscoverPreview from "./DiscoverPreview";

const WARN_ICONS: Record<string, string> = {
  length: "📏",
  quotes: "💬",
  names: "👤",
  verb: "💪",
  grammar: "⚠️",
};

interface Props {
  data: GeneratedTitle;
  outlet?: string;
}

export default function TitleCard({ data, outlet = "TGCOM24" }: Props) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isPrecise = data.variant === "precise";
  const accentColor = isPrecise ? "var(--precise)" : "var(--bold)";
  const accentBg = isPrecise ? "var(--ok-light)" : "var(--warn-light)";
  const label = isPrecise ? "PROTAGONISTA" : "RIVELAZIONE";

  async function copyTitle() {
    await navigator.clipboard.writeText(data.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.65rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: accentBg,
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setShowPreview(!showPreview)} style={iconBtn}>
            {showPreview ? "✕ preview" : "👁 preview"}
          </button>
          <button
            onClick={copyTitle}
            style={{ ...iconBtn, color: copied ? "var(--ok)" : "var(--text-muted)", borderColor: copied ? "var(--ok)" : "var(--border)" }}
          >
            {copied ? "✓ copiato" : "⎘ copia"}
          </button>
        </div>
      </div>

      {/* Main text */}
      <div style={{ padding: "1rem 1.25rem 0.75rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: "var(--text)",
            wordBreak: "break-word",
            fontWeight: 300,
          }}
        >
          {data.text}
        </p>
      </div>

      {/* Char counter */}
      <div style={{ padding: "0 1.25rem 0.85rem" }}>
        <CharCounter count={data.charCount} />
      </div>

      {/* Validation badges */}
      {data.validation.warnings.length > 0 && (
        <div style={{ padding: "0 1.25rem 0.85rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {data.validation.warnings.map((w, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.7rem",
                padding: "3px 8px",
                borderRadius: "99px",
                background: "var(--warn-light)",
                border: "1px solid #fcd34d",
                color: "var(--warn)",
                fontWeight: 400,
              }}
            >
              {WARN_ICONS[w.type] ?? "⚠️"} {w.message}
            </span>
          ))}
        </div>
      )}

      {data.validation.ok && (
        <div style={{ padding: "0 1.25rem 0.85rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.7rem",
              padding: "3px 8px",
              borderRadius: "99px",
              background: "var(--ok-light)",
              border: "1px solid #6ee7b7",
              color: "var(--ok)",
              fontWeight: 400,
            }}
          >
            ✓ Nessun problema rilevato
          </span>
        </div>
      )}

      {/* Discover preview */}
      {showPreview && (
        <div
          style={{
            padding: "1rem 1.25rem 1.25rem",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <DiscoverPreview title={data.text} outlet={outlet} />
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "3px 8px",
  color: "var(--text-muted)",
  fontSize: "0.75rem",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 400,
};
