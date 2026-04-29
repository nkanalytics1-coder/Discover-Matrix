import { NextRequest, NextResponse } from "next/server";

// Static paths that should never be treated as project slugs
const STATIC_SLUGS = new Set(["new", "admin", "api", "_next", "favicon.ico"]);

// /[slug]/generator or /[slug]/history
const PROJECT_PROTECTED = /^\/([^/]+)\/(generator|history)(\/|$)/;
// /admin (but not /admin/login)
const ADMIN_PROTECTED = /^\/admin(?!\/login)(\/|$)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin panel protection
  if (ADMIN_PROTECTED.test(pathname)) {
    const adminCookie = req.cookies.get("dm_admin")?.value;
    const adminCode = process.env.ADMIN_CODE;
    if (!adminCode || adminCookie !== adminCode) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Project page protection
  const match = pathname.match(PROJECT_PROTECTED);
  if (match) {
    const slug = match[1];
    if (STATIC_SLUGS.has(slug)) return NextResponse.next();
    const cookie = req.cookies.get(`dm_auth_${slug}`)?.value;
    if (!cookie) {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
