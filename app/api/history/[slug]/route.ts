import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug, getHistory } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Progetto non trovato" }, { status: 404 });

  const cookie = req.cookies.get(`dm_auth_${slug}`)?.value;
  if (!cookie || cookie !== project.secret_code) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const history = await getHistory(project.id);
  return NextResponse.json(history);
}
