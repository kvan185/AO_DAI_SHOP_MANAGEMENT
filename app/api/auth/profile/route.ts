import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Fetch current user full profile
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const token = cookies().get(sid ? `auth_token_s${sid}` : 'auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.id;

        const [rows]: any = await pool.query(
            'SELECT username, email, fullname, phone, address FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json({ profile: rows[0] });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// Update profile
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const token = cookies().get(sid ? `auth_token_s${sid}` : 'auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.id;
        const { fullname, phone, address } = await req.json();

        await pool.query(
            'UPDATE users SET fullname = ?, phone = ?, address = ? WHERE id = ?',
            [fullname, phone, address, userId]
        );

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
