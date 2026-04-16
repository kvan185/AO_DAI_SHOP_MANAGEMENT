import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const sid = searchParams.get('sid');
  
  const cookieName = sid ? `auth_token_s${sid}` : 'auth_token';
  const token = req.cookies.get(cookieName)?.value;

  // Configuration for protected routes
  const authConfig = [
    { prefix: '/admin/users', roles: ['admin', 'manager'] },
    { prefix: '/admin/reports', roles: ['admin', 'manager'] },
    { prefix: '/admin/stats', roles: ['admin', 'manager'] },
    { prefix: '/admin/products', roles: ['admin', 'manager', 'staff'] },
    { prefix: '/admin/orders', roles: ['admin', 'manager', 'staff'] },
    { prefix: '/admin/categories', roles: ['admin', 'manager'] },
    { prefix: '/admin/coupons', roles: ['admin', 'manager'] },
    { prefix: '/admin', roles: ['admin', 'manager', 'staff'] }, // Dashboard needs staff access for order stats
    { prefix: '/profile', roles: ['admin', 'manager', 'staff', 'customer'] },
    { prefix: '/orders', roles: ['admin', 'manager', 'staff', 'customer'] },
  ];

  const matched = authConfig.find(c => pathname.startsWith(c.prefix));

  if (matched) {
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      if (sid) url.searchParams.set('sid', sid);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      if (!matched.roles.includes(userRole)) {
        // Redirect to login if role is unauthorized for this path
        const url = new URL('/login', req.url);
        url.searchParams.set('unauthorized', 'true');
        if (sid) url.searchParams.set('sid', sid);
        return NextResponse.redirect(url);
      }
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user', JSON.stringify(payload));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error: any) {
      // Token expired or invalid
      console.error('Middleware JWT Error:', error.message, 'Token:', token);
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      if (sid) url.searchParams.set('sid', sid);
      const response = NextResponse.redirect(url);
      response.cookies.delete(cookieName);
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/staff/:path*', '/profile/:path*', '/orders/:path*'],
};
