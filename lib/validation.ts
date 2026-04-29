import type { ValidationResult, ValidationWarning } from "./types";

export function validateTitle(title: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const len = title.length;

  if (len < 70) {
    warnings.push({ type: "length", message: `Troppo corto (${len} car.) — ottimale 70-120` });
  } else if (len > 120) {
    warnings.push({ type: "length", message: `Troppo lungo (${len} car.) — ottimale 70-120` });
  }

  const hasQuotes = /"[^"]{4,}"/.test(title) || /«[^»]{4,}»/.test(title);
  if (!hasQuotes) {
    warnings.push({ type: "quotes", message: '8/10 top titoli hanno virgolette dirette' });
  }

  const hasFullName = /\b[A-ZÀÁÂÈÉÊÌÍÎÒÓÔÙÚÛ][a-zàáâèéêìíîòóôùúû]+\s+[A-ZÀÁÂÈÉÊÌÍÎÒÓÔÙÚÛ][a-zàáâèéêìíîòóôùúû]+\b/.test(title);
  if (!hasFullName) {
    warnings.push({ type: "names", message: "Mancano nomi propri completi (Nome Cognome)" });
  }

  const weakVerbs = /\b(dice|ha detto|ha dichiarato|comunica|fa sapere|afferma)\b/i;
  if (weakVerbs.test(title)) {
    warnings.push({ type: "verb", message: "Verbo debole — usa: rivela, confessa, accusa, spunta" });
  }

  const grammarPatterns = [
    { re: /qual'è/i, msg: "Errore: 'qual'è' → scrivi 'qual è'" },
    { re: /un pò/i, msg: "Errore: 'un pò' → scrivi 'un po''" },
    { re: /\b(perche|poiche)\b/i, msg: "Manca accento: perché / poiché" },
    { re: /\b(ha concordato|ha evidenziato|ha sottolineato)\b/i, msg: "Linguaggio burocratico — semplifica" },
  ];
  for (const { re, msg } of grammarPatterns) {
    if (re.test(title)) {
      warnings.push({ type: "grammar", message: msg });
      break;
    }
  }

  return { ok: warnings.length === 0, warnings };
}

export function cleanTitle(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
