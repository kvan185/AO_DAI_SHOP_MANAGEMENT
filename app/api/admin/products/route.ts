import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import { slugify, ensureDir } from '@/lib/fileUtils';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId');
        
        // Joined query to get the primary image path
        let query = `
            SELECT p.*, c.name as category_name, pi.image_path 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE p.name LIKE ?
        `;
        const params: any[] = [`%${search}%`];

        if (categoryId) {
            query += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows]: any = await pool.query(query, params);
        return NextResponse.json({ products: rows });
    } catch (error) {
        console.error('List Products Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;

    const connection = await pool.getConnection();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const sku = formData.get('sku') as string;
        const slug = formData.get('slug') as string;
        const category_id = formData.get('category_id') as string;
        const price = parseFloat(formData.get('price') as string || '0');
        const discount_price_str = formData.get('discount_price') as string;
        const discount_price = (discount_price_str && discount_price_str !== 'null') ? parseFloat(discount_price_str) : null;
        const description = formData.get('description') as string;
        const stock = parseInt(formData.get('stock') as string || '0');
        const is_active = formData.get('is_active') === 'true';

        const newImages = formData.getAll('new_images') as File[];

        if (!name || isNaN(price) || !category_id) {
            return NextResponse.json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }, { status: 400 });
        }

        await connection.beginTransaction();

        // 1. Insert product (without image_path)
        const [result]: any = await connection.query(
            'INSERT INTO products (category_id, name, sku, slug, price, discount_price, description, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, sku, slug, price, discount_price, description, stock, is_active]
        );
        const productId = result.insertId;

        // 2. Handle multiple image uploads
        if (newImages.length > 0) {
            // Lấy tên danh mục để định danh thư mục
            const [catRows]: any = await connection.query('SELECT name FROM categories WHERE id = ?', [category_id]);
            const categoryName = catRows.length > 0 ? catRows[0].name : 'unknown';
            
            const catSlug = slugify(categoryName);
            const prodSlug = slugify(name);
            const relativeDir = `/uploads/products/${catSlug}/${prodSlug}`;
            const uploadDir = path.join(process.cwd(), 'public', relativeDir);
            
            await ensureDir(uploadDir);

            for (let i = 0; i < newImages.length; i++) {
                const file = newImages[i];
                if (file.size === 0) continue;

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const filename = `${Date.now()}-${i}-${file.name.replace(/\s+/g, '_')}`;
                const filePath = path.join(uploadDir, filename);
                const relativePath = `${relativeDir}/${filename}`;
                
                await writeFile(filePath, buffer);

                // Insert into product_images (First image is primary by default)
                const isPrimary = i === 0;
                await connection.query(
                    'INSERT INTO product_images (product_id, image_path, is_primary, display_order) VALUES (?, ?, ?, ?)',
                    [productId, relativePath, isPrimary, i]
                );
            }
        }

        // 3. Handle Variants
        const variants_str = formData.get('variants') as string;
        const variants = variants_str ? JSON.parse(variants_str) : [];
        
        for (const v of variants) {
            const variantSku = (v.sku && v.sku.trim() !== '') ? v.sku.trim() : null;
            await connection.query(
                'INSERT INTO product_variants (product_id, size, color, sku, stock, price_override) VALUES (?, ?, ?, ?, ?, ?)',
                [productId, v.size, v.color, variantSku, v.stock || 0, v.price_override || null]
            );
        }

        await connection.commit();

        return NextResponse.json({ 
            message: 'Sản phẩm mới đã được tạo thành công', 
            productId 
        }, { status: 201 });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('Create Product Error:', error);
        return NextResponse.json({ message: 'Lỗi máy chủ: ' + error.message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
