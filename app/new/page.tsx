"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "info" | "analyzing" | "tov" | "manual";

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");

  // Step 1 fields
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  // Step 2/3 data
  const [tov, setTov] = useState("");
  const [titlesUsed, setTitlesUsed] = useState(0);
  const [rssFound, setRssFound] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  // Manual fallback
  const [manualText, setManualText] = useState("");

  // Step 3 submit
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleAnalyze() {
    setAnalyzeError("");
    setStep("analyzing");
    try {
      const res = await fetch("/api/analyze-tov", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name }),
      });
      const data = await res.json();
      if (res.status === 422) {
        // RSS not found or insufficient titles
        setStep("manual");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Errore analisi");
      setTov(data.tov);
      setTitlesUsed(data.titlesUsed);
      setRssFound(data.rssFound);
      setStep("tov");
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Errore");
      setStep("info");
    }
  }

  async function handleManualAnalyze() {
    const titles = manualText.split("\n").map((t) => t.trim()).filter((t) => t.length > 10);
    if (titles.length < 5) { setAnalyzeError("Inserisci almeno 5 titoli (uno per riga)"); return; }
    setAnalyzeError("");
    setStep("analyzing");
    const res = await fetch("/api/analyze-tov", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, name, manualTitles: titles }),
    });
    const data = await res.json();
    if (!res.ok) { setAnalyzeError(data.error); setStep("manual"); return; }
    setTov(data.tov);
    setTitlesUsed(data.titlesUsed);
    setRssFound(false);
    setStep("tov");
  }

  async function handleCreate() {
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, homepage_url: url, secret_code: secretCode, tov }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setCreating(false); return; }
    // Auto-login
    await fetch(`/api/auth/${data.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: secretCode }),
    });
    router.push(`/${data.slug}/generator`);
  }

  const step1Valid = name.trim() && url.trim() && slug.trim() && secretCode.trim();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => router.push("/")} style={ghostBtn}>← Torna</button>
        <span style={{ fontWeight: 700 }}>Nuovo progetto</span>
      </header>

      <main style={{ maxWidth: "580px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* STEP 1 — Info */}
        {(step === "info" || step === "analyzing") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <StepLabel n={1} label="Informazioni di base" />

            <Field label="Nome testata" value={name} onChange={handleNameChange} placeholder="es. Corriere della Sera" />
            <Field label="URL homepage" value={url} onChange={setUrl} placeholder="https://www.corriere.it" type="url" />
            <div>
              <Field
                label="Slug (URL del progetto)"
                value={slug}
                onChange={(v) => { setSlug(slugify(v)); setSlugTouched(true); }}
                placeholder="es. corriere-della-sera"
              />
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                Sarà accessibile su <code style={{ background: "var(--surface-2)", padding: "0 4px", borderRadius: "3px" }}>/{slug || "slug"}</code>
              </p>
            </div>
            <Field label="Secret code d'accesso" value={secretCode} onChange={setSecretCode} placeholder="Scegli una password" type="password" />

            {analyzeError && <ErrorBox>{analyzeError}</ErrorBox>}

            <button
              onClick={handleAnalyze}
              disabled={!step1Valid || step === "analyzing"}
              style={{ ...primaryBtn, opacity: !step1Valid || step === "analyzing" ? 0.5 : 1 }}
            >
              {step === "analyzing" ? "Analisi RSS in corso..." : "Avanti — Analizza tono editoriale →"}
            </button>
          </div>
        )}

        {/* STEP — Manual fallback */}
        {step === "manual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <StepLabel n={2} label="Feed RSS non trovato — inserisci titoli manualmente" />
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
              Non ho trovato un feed RSS per <strong>{url}</strong>. Incolla 5-20 titoli recenti della testata (uno per riga) per analizzare il tone of voice.
            </p>
            <div>
              <label style={labelStyle}>Titoli di esempio</label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={10}
                placeholder={"Titolo articolo 1\nTitolo articolo 2\n..."}
                style={textareaStyle}
              />
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                {manualText.split("\n").filter((t) => t.trim().length > 10).length} titoli inseriti (min. 5)
              </p>
            </div>
            {analyzeError && <ErrorBox>{analyzeError}</ErrorBox>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep("info")} style={ghostBtn}>← Indietro</button>
              <button onClick={handleManualAnalyze} style={primaryBtn}>Analizza titoli →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — ToV review */}
        {step === "tov" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <StepLabel n={3} label="Profilo editoriale generato" />
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {rssFound ? `✓ Analizzati ${titlesUsed} titoli dal feed RSS` : `✓ Analizzati ${titlesUsed} titoli inseriti manualmente`}
            </div>
            <div>
              <label style={labelStyle}>Tone of voice (modificabile)</label>
              <textarea
                value={tov}
                onChange={(e) => setTov(e.target.value)}
                rows={14}
                style={textareaStyle}
              />
            </div>
            {createError && <ErrorBox>{createError}</ErrorBox>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep("info")} style={ghostBtn}>← Ricomincia</button>
              <button onClick={handleCreate} disabled={creating} style={{ ...primaryBtn, opacity: creating ? 0.5 : 1 }}>
                {creating ? "Creazione in corso..." : "✓ Crea progetto"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
      <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "0.7rem 1rem", background: "var(--danger-light)", border: "1px solid #fca5a5", borderRadius: "8px", color: "var(--danger)", fontSize: "0.85rem" }}>{children}</div>;
}

const primaryBtn: React.CSSProperties = { background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", padding: "0.7rem 1.25rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" };
const ghostBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: "7px", padding: "0.5rem 1rem", color: "var(--text)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.65rem 0.9rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" };
const textareaStyle: React.CSSProperties = { width: "100%", padding: "0.65rem 0.9rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", lineHeight: 1.5, resize: "vertical" };
