import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, getProjectBySlug } from "@/lib/db";
import type { CreateProjectRequest } from "@/lib/types";

export async function GET() {
  try {
    const projects = await getProjects();
    // Never expose secret_code to the client
    return NextResponse.json(projects.map(({ secret_code: _, ...p }) => p));
  } catch (err) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: CreateProjectRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request non valida" }, { status: 400 });
  }

  const { name, slug, homepage_url, secret_code, tov } = body;
  if (!name?.trim() || !slug?.trim() || !homepage_url?.trim() || !secret_code?.trim() || !tov?.trim()) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const existing = await getProjectBySlug(slugClean);
  if (existing) {
    return NextResponse.json({ error: "Slug già in uso — scegli un nome diverso" }, { status: 409 });
  }

  try {
    const project = await createProject({ name: name.trim(), slug: slugClean, homepage_url: homepage_url.trim(), secret_code: secret_code.trim(), tov });
    const { secret_code: _, ...safe } = project;
    return NextResponse.json(safe, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore DB";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
