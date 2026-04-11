import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Check if requester is admin
async function isAdmin() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.role === 'admin';
    } catch (e) {
        return false;
    }
}

export async function GET() {
    try {
        const [rows]: any = await pool.query('SELECT id, username, email, role, is_locked, created_at FROM users ORDER BY created_at DESC');
        return NextResponse.json({ users: rows });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // SECURITY: Only Admin can change roles or lock accounts
    if (!(await isAdmin())) {
        return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    try {
        const { id, role, is_locked } = await req.json();

        await pool.query(
            'UPDATE users SET role = ?, is_locked = ? WHERE id = ?',
            [role, is_locked, id]
        );

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
