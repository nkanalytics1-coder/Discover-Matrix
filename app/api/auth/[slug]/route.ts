import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { code } = await req.json();

  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Progetto non trovato" }, { status: 404 });
  if (code !== project.secret_code) return NextResponse.json({ error: "Codice non valido" }, { status: 401 });

  const res = NextResponse.json({ ok: true, projectId: project.id });
  res.cookies.set(`dm_auth_${slug}`, project.secret_code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(`dm_auth_${slug}`);
  return res;
}
