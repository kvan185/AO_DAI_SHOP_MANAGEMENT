import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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
        const categoryId = searchParams.get('categoryId');
        
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name LIKE ?';
        const params: any[] = [`%${search}%`];

        if (categoryId) {
            query += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows]: any = await pool.query(query, params);
        return NextResponse.json({ products: rows });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const connection = await pool.getConnection();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const category_id = formData.get('category_id') as string;
        const price = formData.get('price') as string;
        const description = formData.get('description') as string;
        const stock = formData.get('stock') as string;
        const files = formData.getAll('images') as File[]; // Get multiple files

        if (!name || !price || !category_id) {
            return NextResponse.json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }, { status: 400 });
        }

        await connection.beginTransaction();

        // 1. Insert product
        const [result]: any = await connection.query(
            'INSERT INTO products (category_id, name, price, description, stock) VALUES (?, ?, ?, ?, ?)',
            [category_id, name, price, description, stock]
        );
        const productId = result.insertId;

        // 2. Handle multiple image uploads
        if (files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'public/uploads/products');
            await mkdir(uploadDir, { recursive: true });

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size === 0) continue;

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const filename = `${Date.now()}-${i}-${file.name.replaceAll(' ', '_')}`;
                const filePath = path.join(uploadDir, filename);
                const relativePath = `/uploads/products/${filename}`;
                
                await writeFile(filePath, buffer);

                // Insert into product_images
                const isPrimary = i === 0; // First image is primary by default
                await connection.query(
                    'INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)',
                    [productId, relativePath, isPrimary]
                );

                // Update products table for legacy/cover support
                if (isPrimary) {
                    await connection.query('UPDATE products SET image_path = ? WHERE id = ?', [relativePath, productId]);
                }
            }
        }

        await connection.commit();

        return NextResponse.json({ 
            message: 'Sản phẩm và bộ sưu tập ảnh đã được tạo thành công', 
            productId 
        }, { status: 201 });

    } catch (error: any) {
        await connection.rollback();
        console.error('Create Product Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
