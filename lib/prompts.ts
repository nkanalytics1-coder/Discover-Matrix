import type { Outlet } from "./types";

const TONE: Record<Outlet, string> = {
  TGCOM: "giornalistico, autorevole, con sensibilità emotiva",
  SPORT: "energico, diretto, entusiasta",
  INFINITY: "informale, fresco, conversazionale",
};

export function buildSystemPrompt(): string {
  return `Sei un headline editor di giornalismo digitale italiano, specializzato in Google Discover.

I titoli ad alto CTR su Discover attivano UN meccanismo psicologico preciso:
• RICONOSCIMENTO — il lettore conosce il protagonista e vuole sapere cosa ha fatto/detto
• SORPRESA — l'informazione contrasta le aspettative e crea urgenza di capire
• TENSIONE NARRATIVA — si intuisce un conflitto o una risoluzione inattesa

Regola d'oro: scegli l'angolo più forte e costruisci tutto intorno a quello.
Non cercare di soddisfare più criteri contemporaneamente: la focalizzazione batte la completezza.

VINCOLI TECNICI:
- Lunghezza: 75-110 caratteri (Discover tronca oltre 120 su mobile)
- Voce attiva sempre
- Verbi ad alta tensione: rivela, confessa, rompe il silenzio, spunta, scoperto, ribalta
- Specificità obbligatoria: nomi reali, cifre reali, luoghi reali — zero vaghezza

OUTPUT: solo il titolo finale. Niente virgolette esterne, niente parentesi quadre [], niente segnaposto.`;
}

export function buildUserPrompt(
  h1: string,
  occhiello: string,
  outlet: Outlet,
  variant: "precise" | "bold"
): string {
  const tone = TONE[outlet];

  const variantInstruction =
    variant === "precise"
      ? `ANGOLO PROTAGONISTA
Costruisci il titolo attorno alla persona o voce principale della storia.
Se esiste una citazione reale, usala. Se no, sintetizza la sua posizione in prima persona tra virgolette.
Formula guida: [Nome Cognome], "[frase che cattura emozione o posizione]": [contesto minimo]
Se non c'è un protagonista chiaro, usa il contrasto aspettativa/realtà come apertura.`
      : `ANGOLO RIVELAZIONE
Costruisci il titolo attorno all'elemento più sorprendente o inatteso della storia.
Chiediti: cosa avrebbe sorpreso di più il lettore medio 24 ore fa?
Parti da lì — il contrasto con le aspettative è il gancio.
Formula guida: [Elemento inatteso/rottura], [dettaglio specifico che alimenta curiosità]: [implicazione]
Puoi iniziare con il luogo, l'evento o il dato più dirompente.`;

  return `ARTICOLO:
Occhiello (contesto semantico): "${occhiello}"
H1 originale (base da riscrivere): "${h1}"
Outlet: ${outlet} — Tono: ${tone}

${variantInstruction}

CRITERI DI QUALITÀ:
✓ I primi 40 caratteri contengono l'elemento emotivo più forte
✓ Il lettore capisce il tema ma non conosce ancora l'esito → deve cliccare
✓ Nessuna parola vaga o burocratica
✓ 75-110 caratteri

Scrivi UN solo titolo italiano. Grammatica perfetta.`;
}
