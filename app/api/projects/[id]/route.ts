import { NextRequest, NextResponse } from "next/server";
import { deleteProject, updateProjectLimits } from "@/lib/db";

function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("dm_admin")?.value;
  return cookie && cookie === process.env.ADMIN_CODE;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;
  await deleteProject(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;
  const { daily_limit, monthly_limit } = await req.json();
  if (typeof daily_limit !== "number" || typeof monthly_limit !== "number") {
    return NextResponse.json({ error: "Limiti non validi" }, { status: 400 });
  }
  await updateProjectLimits(id, daily_limit, monthly_limit);
  return NextResponse.json({ ok: true });
}
