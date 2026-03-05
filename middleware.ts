export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/today/:path*", "/week/:path*", "/chat/:path*", "/feedback/:path*", "/settings/:path*"],
}
