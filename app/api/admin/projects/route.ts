import { NextRequest, NextResponse } from "next/server";
import { getProjectsWithUsage } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("dm_admin")?.value;
  if (!cookie || cookie !== process.env.ADMIN_CODE) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const projects = await getProjectsWithUsage();
  return NextResponse.json(projects.map(({ secret_code: _, ...p }) => p));
}
