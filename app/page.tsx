"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.push("/generator");
      } else {
        const data = await res.json();
        setError(data.error || "Codice non valido");
      }
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
            Discover Matrix
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Generatore og:title per Google Discover
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="code"
            style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}
          >
            Codice di accesso
          </label>
          <input
            id="code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••••"
            autoFocus
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              background: "var(--surface-2)",
              border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "1rem",
              outline: "none",
              marginBottom: "1rem",
            }}
          />
          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginBottom: "0.75rem", marginTop: "-0.5rem" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !code}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading || !code ? "#c8ccdc" : "var(--accent)",
              color: loading || !code ? "var(--text-muted)" : "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: loading || !code ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
