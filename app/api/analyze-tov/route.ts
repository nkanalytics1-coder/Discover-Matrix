import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchRSSTitles } from "@/lib/rss";
import { buildTovPrompt } from "@/lib/prompts";
import type { AnalyzeTovRequest, AnalyzeTovResponse } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  let body: AnalyzeTovRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request non valida" }, { status: 400 });
  }

  const { url, name, manualTitles } = body;
  if (!url?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "url e name sono obbligatori" }, { status: 400 });
  }

  let titles: string[] = manualTitles ?? [];
  let rssFound = false;

  if (!manualTitles || manualTitles.length === 0) {
    titles = await fetchRSSTitles(url);
    rssFound = titles.length >= 5;
  }

  if (titles.length < 3) {
    return NextResponse.json({ error: "Titoli insufficienti. Incolla almeno 5 titoli di esempio.", rssFound: false } as AnalyzeTovResponse & { error: string }, { status: 422 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    temperature: 0.3,
    messages: [{ role: "user", content: buildTovPrompt(name, titles) }],
  });

  const tov = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  return NextResponse.json({ tov, titlesUsed: titles.length, rssFound } satisfies AnalyzeTovResponse);
}
