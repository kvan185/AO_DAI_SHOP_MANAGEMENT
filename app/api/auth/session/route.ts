import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function GET() {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({
      authenticated: true,
      user: {
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
