import type { Outlet } from "./types";

const TONE: Record<Outlet, string> = {
  TGCOM: "giornalistico, professionale, autorevole, con sensibilità emotiva e curiosità umana",
  SPORT: "energico, diretto, entusiasta, motivazionale, vivace",
  INFINITY: "informale, fresco, intrattenitivo, conversazionale, pop",
};

export function buildSystemPrompt(): string {
  return `Sei un esperto ottimizzatore di titoli editoriali italiani per Google Discover.
Hai analizzato 1.000 titoli reali di TGCOM24 e conosci con precisione cosa genera alto CTR (fino al 34,17%) e cosa lo abbassa.
Produci SOLO il titolo finale. Zero virgolette extra, zero parentesi quadre [], zero segnaposto.`;
}

export function buildUserPrompt(h1: string, occhiello: string, outlet: Outlet, variant: "precise" | "bold"): string {
  const tone = TONE[outlet];
  const tempNote = variant === "precise"
    ? "Versione PRECISA: mantieni fedeltà ai fatti, usa citazioni reali se presenti, tono controllato."
    : "Versione AUDACE: massimizza l'impatto emotivo, scegli l'angolo più sorprendente, tono più forte.";

  return `CONTESTO ARTICOLO:
- Occhiello (contesto semantico): "${occhiello}"
- H1 originale (base da riscrivere): "${h1}"
- Outlet: ${outlet} — Tone of voice: ${tone}

VARIANTE: ${tempNote}

REGOLE CRITICHE (top CTR >25%):
1. LUNGHEZZA: 70-120 caratteri (sweet spot 80-100)
2. CITAZIONE DIRETTA: usa virgolette "..." con frase emotiva forte quando possibile
   Pattern ideale: Nome Cognome, "frase shock o rivelazione"
3. NOMI PROPRI COMPLETI: sempre nome + cognome di persone note (VIP, politici, figure pubbliche)
4. VERBI FORTI: rivela, confessa, accusa, spunta, scoperto, trovato — NON: dice, ha dichiarato, comunica
5. HOOK DRAMMATICO: morte, scandalo, shock, esclusivo + dettaglio umano specifico
6. DETTAGLI SPECIFICI: età, importi, città italiane, durate precise ("14 mesi" non "oltre un anno")
7. CURIOSITY GAP: rivela abbastanza da incuriosire, lascia un dettaglio chiave non detto
8. APERTURA FORTE: i primi 40 caratteri devono contenere l'elemento più emotivo o il nome più noto

FORMULE AD ALTO CTR:
- Nome VIP, "citazione shock": contesto breve
- Città, evento tragico: dettaglio specifico
- Caso noto, rivelazione: "citazione"
- Nome1 e Nome2, evento inatteso: dettaglio
- Caso, spunta elemento chiave: cosa significa

DA EVITARE (CTR <10%):
- Linguaggio istituzionale o burocratico
- Voce passiva
- Acronimi in apertura
- Titoli vaghi senza nomi propri
- Notizie di servizio o tecnico-finanziarie senza gancio emotivo
- Copia letterale dell'H1

OUTPUT: UN SOLO titolo italiano (70-120 caratteri). Grammatica perfetta. Zero parentesi quadre [].`;
}
