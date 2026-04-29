import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/generator", "/history"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const secret = process.env.SECRET_CODE;
  const cookie = req.cookies.get("dm_auth")?.value;

  if (!secret || cookie !== secret) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generator/:path*", "/history/:path*"],
};
