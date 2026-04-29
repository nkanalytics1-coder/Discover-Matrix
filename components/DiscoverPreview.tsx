interface Props {
  title: string;
  outlet: string;
}

export default function DiscoverPreview({ title, outlet }: Props) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
        Preview Google Discover (mobile)
      </div>
      {/* Mobile card wrapper */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          maxWidth: "360px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          fontFamily: "'Google Sans', Roboto, sans-serif",
        }}
      >
        {/* Fake image placeholder */}
        <div
          style={{
            height: "180px",
            background: "linear-gradient(135deg, #1a1d27 0%, #2e3347 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3a3f5a",
            fontSize: "2rem",
          }}
        >
          📰
        </div>
        {/* Card body */}
        <div style={{ padding: "12px 14px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {outlet.charAt(0)}
            </div>
            <span style={{ fontSize: "11px", color: "#5f6368" }}>{outlet}</span>
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
            }}
          >
            {title || "Il tuo titolo apparirà qui"}
          </div>
        </div>
      </div>
    </div>
  );
}
