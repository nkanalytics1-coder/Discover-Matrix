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
  const label = isPrecise ? "PRECISO" : "AUDACE";
  const emoji = isPrecise ? "📋" : "🔥";

  async function copyTitle() {
    await navigator.clipboard.writeText(data.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{emoji}</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: accentColor, letterSpacing: "0.1em" }}>
            {label}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            temp {isPrecise ? "0.4" : "0.9"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            title="Preview Discover"
            style={iconBtn}
          >
            {showPreview ? "✕ preview" : "👁 preview"}
          </button>
          <button
            onClick={copyTitle}
            title="Copia"
            style={{
              ...iconBtn,
              color: copied ? "var(--ok)" : "var(--text-muted)",
            }}
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
            fontSize: "1rem",
            lineHeight: 1.55,
            color: "var(--text)",
            wordBreak: "break-word",
          }}
        >
          {data.text}
        </p>
      </div>

      {/* Char counter */}
      <div style={{ padding: "0 1.25rem 0.75rem" }}>
        <CharCounter count={data.charCount} />
      </div>

      {/* Validation badges */}
      {data.validation.warnings.length > 0 && (
        <div
          style={{
            padding: "0.6rem 1.25rem 0.75rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
          }}
        >
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
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "var(--warn)",
              }}
            >
              {WARN_ICONS[w.type] ?? "⚠️"} {w.message}
            </span>
          ))}
        </div>
      )}

      {data.validation.ok && (
        <div style={{ padding: "0 1.25rem 0.75rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.7rem",
              padding: "3px 8px",
              borderRadius: "99px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "var(--ok)",
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
            padding: "0 1.25rem 1.25rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
            marginTop: "0.25rem",
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
  transition: "color 0.15s",
};
