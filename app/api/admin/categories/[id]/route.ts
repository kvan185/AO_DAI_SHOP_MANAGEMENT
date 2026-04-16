import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { slugify } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    
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
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    
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
