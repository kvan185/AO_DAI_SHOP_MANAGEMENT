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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { id } = params;
        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Tên danh mục không được để trống' }, { status: 400 });
        }

        const slug = slugify(name);

        await pool.query(
            'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
            [name, slug, description, id]
        );

        return NextResponse.json({ message: 'Cập nhật danh mục thành công' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: 'Slug đã tồn tại cho một danh mục khác' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { id } = params;

        // Check if there are products using this category
        const [products]: any = await pool.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
        if (products.length > 0) {
            return NextResponse.json({ 
                message: 'Không thể xóa danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.' 
            }, { status: 400 });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
