import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  // Paths that require authentication and specific roles
  const protectedPaths = [
    { path: '/admin/products', roles: ['admin', 'manager', 'staff'] },
    { path: '/admin/orders', roles: ['admin', 'manager', 'staff'] },
    { path: '/admin/users', roles: ['admin', 'manager'] },
    { path: '/admin/reports', roles: ['admin', 'manager'] },
    { path: '/admin', roles: ['admin', 'manager'] }, // Overview dashboard
    { path: '/profile', roles: ['admin', 'manager', 'staff', 'customer'] },
    { path: '/orders', roles: ['admin', 'manager', 'staff', 'customer'] },
  ];

  const matchedPath = protectedPaths.find((p) => pathname.startsWith(p.path));

  if (matchedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      if (!matchedPath.roles.includes(userRole)) {
        // Redirect to 403 or home if role is not allowed
        return NextResponse.redirect(new URL('/403', req.url));
      }
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/staff/:path*', '/profile/:path*', '/orders/:path*'],
};
