import type { Outlet } from "@/lib/types";

const OUTLETS: { id: Outlet; label: string; desc: string }[] = [
  { id: "TGCOM", label: "TGCOM24", desc: "Giornalistico · professionale" },
  { id: "SPORT", label: "Sport Mediaset", desc: "Energico · diretto" },
  { id: "INFINITY", label: "Infinity+", desc: "Informale · pop" },
];

interface Props {
  value: Outlet;
  onChange: (v: Outlet) => void;
}

export default function OutletSelector({ value, onChange }: Props) {
  return (
    <div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Outlet</div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {OUTLETS.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              style={{
                padding: "0.5rem 1rem",
                background: active ? "var(--accent)" : "var(--surface)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "8px",
                color: active ? "#fff" : "var(--text)",
                fontWeight: active ? 700 : 400,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "1px",
              }}
            >
              <span>{o.label}</span>
              <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>{o.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
