interface Props {
  title: string;
  outlet: string;
}

export default function DiscoverPreview({ title, outlet }: Props) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
        Preview Google Discover (mobile)
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          maxWidth: "360px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
          fontFamily: "'Google Sans', Roboto, sans-serif",
        }}
      >
        {/* Fake image placeholder */}
        <div
          style={{
            height: "180px",
            background: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9fa8da",
            fontSize: "2.5rem",
          }}
        >
          📰
        </div>
        {/* Card body */}
        <div style={{ padding: "12px 14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#4f52d6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                color: "#fff",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {outlet.charAt(0)}
            </div>
            <span style={{ fontSize: "11px", color: "#5f6368", fontFamily: "Roboto, sans-serif" }}>{outlet}</span>
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#202124",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontFamily: "'Google Sans', Roboto, sans-serif",
            }}
          >
            {title || "Il tuo titolo apparirà qui"}
          </div>
        </div>
      </div>
    </div>
  );
}
