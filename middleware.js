import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Route pubbliche
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/registrazione' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Controlla il cookie di sessione
  const token = req.cookies.get('riderdash_session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const session = await verifySession(token)
  if (!session) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('riderdash_session')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
