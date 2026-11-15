import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/dashboard/api/session-contract";
import { publicSiteReady, publicBlogStatus } from "@/server/integration/site-readiness";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) {
    if (!await publicSiteReady()) return new NextResponse("Content is temporarily unavailable. Please try again later.", { status: 503, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
    const blog = /^\/blog\/([^/]+)$/.exec(pathname);
    if (blog) {
      let status: 200 | 404 | 503;
      try { status = await publicBlogStatus(decodeURIComponent(blog[1])); } catch { status = 404; }
      // Resolve absence before streaming begins, preserving the existing global404 UI and real HTTP404.
      if (status === 404) return NextResponse.rewrite(new URL("/404", request.url), { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
      if (status === 503) return new NextResponse("Content is temporarily unavailable. Please try again later.", { status: 503, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });
    }
    return NextResponse.next();
  }
  if (pathname === "/dashboard/login" || pathname.startsWith("/dashboard/api/") || /\.[^/]+$/.test(pathname)) return NextResponse.next();
  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    const login = new URL("/dashboard/login", request.url);
    login.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/", "/services", "/about", "/contact", "/gallery", "/youtube-videos", "/blog/:path*", "/sitemap.xml"] };
