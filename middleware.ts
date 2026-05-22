// middleware.ts
import { auth } from "./lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin")
  const isOnAdminApi = req.nextUrl.pathname.startsWith("/api/admin")

  if ((isOnAdmin || isOnAdminApi) && !isLoggedIn) {
    // If it's an API request, return a 401 Unauthorized response
    if (isOnAdminApi) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
    // Otherwise redirect to the login page
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/admin/:path*",
    "/api/admin/:path*",
  ],
}
