import nextAuthMiddleware from "next-auth/middleware"

export const middleware = nextAuthMiddleware

export const config = {
  matcher: ["/today/:path*", "/week/:path*", "/chat/:path*", "/feedback/:path*", "/settings/:path*"],
}
