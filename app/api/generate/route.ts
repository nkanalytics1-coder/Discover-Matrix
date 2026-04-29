import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { cleanTitle } from "@/lib/validation";
import { validateTitle } from "@/lib/validation";
import type { GenerateRequest, GeneratedTitle } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generate(
  h1: string,
  occhiello: string,
  outlet: GenerateRequest["outlet"],
  variant: "precise" | "bold"
): Promise<GeneratedTitle> {
  const temperature = variant === "precise" ? 0.5 : 0.85;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 150,
    temperature,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(h1, occhiello, outlet, variant) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const text = cleanTitle(raw);
  const validation = validateTitle(text);

  return { text, variant, charCount: text.length, validation };
}

export async function POST(req: NextRequest) {
  const secret = process.env.SECRET_CODE;
  const cookie = req.cookies.get("dm_auth")?.value;
  if (!secret || cookie !== secret) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY mancante" }, { status: 500 });
  }

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request non valida" }, { status: 400 });
  }

  const { h1, occhiello, outlet } = body;
  if (!h1?.trim() || !occhiello?.trim() || !outlet) {
    return NextResponse.json({ error: "h1, occhiello e outlet sono obbligatori" }, { status: 400 });
  }

  try {
    const [precise, bold] = await Promise.all([
      generate(h1.trim(), occhiello.trim(), outlet, "precise"),
      generate(h1.trim(), occhiello.trim(), outlet, "bold"),
    ]);
    return NextResponse.json({ precise, bold });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore generazione";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
