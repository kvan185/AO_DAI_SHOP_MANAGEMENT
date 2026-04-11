import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { id } = params;
        const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return NextResponse.json({ message: 'Sản phẩm không tồn tại' }, { status: 404 });
        }
        
        const [images]: any = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC, created_at ASC', [id]);
        
        return NextResponse.json({ 
            product: rows[0],
            images: images
        });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const connection = await pool.getConnection();
    try {
        const { id } = params;
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
        
        // --- Server-side Validation ---
        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Tên sản phẩm không được để trống' }, { status: 400 });
        }
        if (isNaN(price) || price < 0) {
            return NextResponse.json({ message: 'Giá gốc không hợp lệ' }, { status: 400 });
        }
        if (discount_price !== null && (isNaN(discount_price) || discount_price >= price)) {
            return NextResponse.json({ message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' }, { status: 400 });
        }

        // Robust array parsing
        const newImages = formData.getAll('new_images') as File[];
        const deleteImageIds = (formData.get('delete_image_ids') as string || '')
            .split(',')
            .filter(Boolean)
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

        const sortedImageIds = (formData.get('sorted_image_ids') as string || '')
            .split(',')
            .filter(Boolean)
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

        await connection.beginTransaction();

        // 1. Check SKU & Slug uniqueness
        if (sku) {
            const [skuRows]: any = await connection.query('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, id]);
            if (skuRows.length > 0) {
                await connection.rollback();
                return NextResponse.json({ message: 'Mã SKU đã tồn tại' }, { status: 400 });
            }
        }
        if (slug) {
            const [slugRows]: any = await connection.query('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, id]);
            if (slugRows.length > 0) {
                await connection.rollback();
                return NextResponse.json({ message: 'Đường dẫn Slug này đã tồn tại' }, { status: 400 });
            }
        }
        
        // 2. Update basic info
        await connection.query(
            'UPDATE products SET name = ?, sku = ?, slug = ?, category_id = ?, price = ?, discount_price = ?, description = ?, stock = ?, is_active = ? WHERE id = ?',
            [name, sku, slug, category_id, price, discount_price, description, stock, is_active, id]
        );

        // 3. Handle deletions
        for (const imgId of deleteImageIds) {
            const [rows]: any = await connection.query('SELECT image_path FROM product_images WHERE id = ? AND product_id = ?', [imgId, id]);
            if (rows.length > 0) {
                const imgPath = rows[0].image_path;
                try {
                    await unlink(path.join(process.cwd(), 'public', imgPath));
                } catch (e) {
                    console.error('File cleanup error:', e);
                }
                await connection.query('DELETE FROM product_images WHERE id = ?', [imgId]);
            }
        }

        // 4. Handle new uploads
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        await mkdir(uploadDir, { recursive: true });

        const [orderRows]: any = await connection.query('SELECT MAX(display_order) as maxOrder FROM product_images WHERE product_id = ?', [id]);
        let nextOrder = (orderRows[0].maxOrder || 0) + 1;

        for (let i = 0; i < newImages.length; i++) {
            const file = newImages[i];
            if (file.size === 0) continue;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${i}-${file.name.replace(/\s+/g, '_')}`;
            const filePath = path.join(uploadDir, filename);
            const relativePath = `/uploads/products/${filename}`;
            
            await writeFile(filePath, buffer);
            await connection.query(
                'INSERT INTO product_images (product_id, image_path, is_primary, display_order) VALUES (?, ?, ?, ?)',
                [id, relativePath, false, nextOrder++]
            );
        }

        // 5. Update display order and primary status
        if (sortedImageIds.length > 0) {
            for (let i = 0; i < sortedImageIds.length; i++) {
                const imgId = sortedImageIds[i];
                const isPrimary = i === 0;
                await connection.query(
                    'UPDATE product_images SET display_order = ?, is_primary = ? WHERE id = ? AND product_id = ?',
                    [i, isPrimary, imgId, id]
                );
            }
        } else {
            // Check if any primary exists
            const [primaryCount]: any = await connection.query('SELECT id FROM product_images WHERE product_id = ? AND is_primary = TRUE', [id]);
            if (primaryCount.length === 0) {
                await connection.query('UPDATE product_images SET is_primary = TRUE WHERE product_id = ? ORDER BY display_order ASC LIMIT 1', [id]);
            }
        }

        await connection.commit();
        return NextResponse.json({ message: 'Cập nhật thành công' });

    } catch (error) {
        await connection.rollback();
        console.error('Update Detail Error:', error);
        return NextResponse.json({ message: 'Lỗi máy chủ: ' + (error as Error).message }, { status: 500 });
    } finally {
        connection.release();
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    if (!(await checkPermission())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const connection = await pool.getConnection();
    try {
        const { id } = params;
        const [images]: any = await connection.query('SELECT image_path FROM product_images WHERE product_id = ?', [id]);
        await connection.beginTransaction();
        for (const img of images) {
            try {
                await unlink(path.join(process.cwd(), 'public', img.image_path));
            } catch (e) {
                console.error('File cleanup error:', e);
            }
        }
        await connection.query('DELETE FROM products WHERE id = ?', [id]);
        await connection.commit();
        return NextResponse.json({ message: 'Đã xóa vĩnh viễn' });
    } catch (error) {
        await connection.rollback();
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
