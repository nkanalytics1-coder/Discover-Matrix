import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const secret = process.env.SECRET_CODE;

  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (code !== secret) {
    return NextResponse.json({ error: "Codice non valido" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("dm_auth", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("dm_auth");
  return res;
}
