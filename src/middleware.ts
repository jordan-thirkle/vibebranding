import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  
  // Protected routes
  const protectedPaths = ['/dashboard', '/api/brand']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  // For now, just pass through — auth will be enforced in the pages/routes themselves
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-192.svg|sitemap.xml|robots.txt).*)',
  ],
}
