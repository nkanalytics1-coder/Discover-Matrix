import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { cleanTitle } from "@/lib/validation";
import { validateTitle } from "@/lib/validation";
import { getProjectBySlug, checkAndIncrementUsage, saveHistory, RateLimitError } from "@/lib/db";
import type { GenerateRequest, GeneratedTitle } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generate(
  h1: string, occhiello: string, tov: string, variant: "precise" | "bold"
): Promise<GeneratedTitle> {
  const temperature = variant === "precise" ? 0.5 : 0.85;
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 150,
    temperature,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(h1, occhiello, tov, variant) }],
  });
  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const text = cleanTitle(raw);
  return { text, variant, charCount: text.length, validation: validateTitle(text) };
}

export async function POST(req: NextRequest) {
  // Auth: get slug from header or body
  let body: GenerateRequest & { slug: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request non valida" }, { status: 400 });
  }

  const { h1, occhiello, slug } = body;
  if (!h1?.trim() || !occhiello?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "h1, occhiello e slug sono obbligatori" }, { status: 400 });
  }

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Progetto non trovato" }, { status: 404 });

  // Validate auth cookie
  const cookie = req.cookies.get(`dm_auth_${slug}`)?.value;
  if (!cookie || cookie !== project.secret_code) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Rate limiting
  let updatedStats;
  try {
    updatedStats = await checkAndIncrementUsage(project.id);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message, usage: err.stats }, { status: 429 });
    }
    throw err;
  }

  const [precise, bold] = await Promise.all([
    generate(h1.trim(), occhiello.trim(), project.tov, "precise"),
    generate(h1.trim(), occhiello.trim(), project.tov, "bold"),
  ]);

  // Save to DB (fire-and-forget, don't block response)
  saveHistory({ project_id: project.id, h1: h1.trim(), occhiello: occhiello.trim(), precise_title: precise.text, bold_title: bold.text }).catch(console.error);

  return NextResponse.json({ precise, bold, usage: updatedStats });
}
