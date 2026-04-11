import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { slugify } from '@/lib/utils';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

async function checkPermission() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return ['admin', 'manager'].includes(payload.role as string);
    } catch {
        return false;
    }
}

export async function GET(req: Request) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        
        let query = 'SELECT * FROM categories WHERE name LIKE ? ORDER BY id DESC';
        const params = [`%${search}%`];

        const [rows]: any = await pool.query(query, params);
        return NextResponse.json({ categories: rows });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { name, description } = await req.json();
        
        if (!name) {
            return NextResponse.json({ message: 'Tên danh mục không được để trống' }, { status: 400 });
        }

        const slug = slugify(name);

        const [result]: any = await pool.query(
            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
            [name, slug, description]
        );

        return NextResponse.json({ 
            message: 'Danh mục đã được tạo thành công',
            categoryId: result.insertId 
        }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: 'Tên danh mục hoặc slug đã tồn tại' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
