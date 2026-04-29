"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Codice admin non valido");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "340px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem 1.75rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", marginTop: 0 }}>Admin — Discover Matrix</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Codice admin" autoFocus style={{ padding: "0.65rem 0.9rem", background: "var(--surface-2)", border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`, borderRadius: "8px", color: "var(--text)", fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading || !code} style={{ padding: "0.65rem", background: !code ? "#c8ccdc" : "var(--accent)", color: !code ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: !code ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
