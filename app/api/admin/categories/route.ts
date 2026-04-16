import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { slugify } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    
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
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
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
