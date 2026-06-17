import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
  const isChatPage = req.nextUrl.pathname.startsWith('/chat');

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/chat', req.nextUrl));
    }
    return null;
  }

  if (isChatPage && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}