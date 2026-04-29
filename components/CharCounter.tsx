interface Props {
  count: number;
}

const MIN = 70;
const MAX = 120;
const SWEET_MIN = 80;
const SWEET_MAX = 100;

export default function CharCounter({ count }: Props) {
  const pct = Math.min((count / MAX) * 100, 100);

  let color = "var(--danger)";
  let label = "Troppo corto";
  if (count >= MIN && count <= MAX) {
    color = "var(--ok)";
    label = count >= SWEET_MIN && count <= SWEET_MAX ? "Ottimale" : "OK";
  } else if (count > MAX) {
    color = "var(--warn)";
    label = "Troppo lungo";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {MIN}–{MAX} car.
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>
          {count} — {label}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--surface-2)",
          borderRadius: "2px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Sweet-spot zone marker */}
        <div
          style={{
            position: "absolute",
            left: `${(SWEET_MIN / MAX) * 100}%`,
            width: `${((SWEET_MAX - SWEET_MIN) / MAX) * 100}%`,
            height: "100%",
            background: "rgba(16,185,129,0.2)",
          }}
        />
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: "2px",
            transition: "width 0.2s, background 0.2s",
          }}
        />
      </div>
    </div>
  );
}
