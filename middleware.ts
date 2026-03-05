import { auth } from '@/lib/auth'

export const middleware = auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup'

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/today', req.nextUrl))
    }
    return null
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  return null
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
