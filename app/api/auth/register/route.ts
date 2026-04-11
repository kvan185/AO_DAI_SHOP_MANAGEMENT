import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { username, password, email } = await req.json();

        // Basic validation
        if (!username || !password || !email) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // Check for existing user
        const [existingUser]: any = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return NextResponse.json({ message: 'User already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.query(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email]
        );

        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
