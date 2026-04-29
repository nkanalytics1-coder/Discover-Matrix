import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ error: "Codice admin non valido" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("dm_admin", adminCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("dm_admin");
  return res;
}
