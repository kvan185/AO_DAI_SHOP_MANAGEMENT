import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import { slugify, ensureDir, renameFolder, deleteFile } from '@/lib/fileUtils';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        const { id } = params;
        const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return NextResponse.json({ message: 'Sản phẩm không tồn tại' }, { status: 404 });
        }
        
        // Return images with is_primary = 1 first
        const [images]: any = await pool.query(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC, created_at ASC', 
            [id]
        );

        // Fetch variants
        const [variants]: any = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [id]);
        
        return NextResponse.json({ 
            product: rows[0],
            images: images,
            variants: variants
        });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    const connection = await pool.getConnection();
    try {
        const { id } = params;
        const formData = await req.formData();
        
        const name = formData.get('name') as string;
        const sku = formData.get('sku') === null ? null : (formData.get('sku') as string);
        const slug = formData.get('slug') === null ? null : (formData.get('slug') as string);
        const category_id = formData.get('category_id') as string;
        const price = parseFloat(formData.get('price') as string || '0');
        const discount_price_str = formData.get('discount_price') as string;
        const discount_price = (discount_price_str && discount_price_str !== 'null') ? parseFloat(discount_price_str) : null;
        const description = formData.get('description') === null ? null : (formData.get('description') as string);
        const stock = parseInt(formData.get('stock') as string || '0');
        const is_active = formData.get('is_active') === 'true';
        const variants_str = formData.get('variants') as string;
        const variants = variants_str ? JSON.parse(variants_str) : [];

        // --- Server-side Validation ---
        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Tên sản phẩm không được để trống' }, { status: 400 });
        }

        const newImages = formData.getAll('new_images') as File[];
        const deleteImageIds = (formData.get('delete_image_ids') as string || '')
            .split(',')
            .filter(Boolean)
            .map(id => parseInt(id));

        const primaryImageId = formData.get('primary_image_id') ? parseInt(formData.get('primary_image_id') as string) : null;

        await connection.beginTransaction();

        // 1. Xác định thư mục cũ và mới
        const [currProd]: any = await connection.query(`
            SELECT p.name, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [id]);
        
        if (currProd.length === 0) {
            await connection.rollback();
            return NextResponse.json({ message: 'Sản phẩm không tồn tại' }, { status: 404 });
        }

        const oldRelDir = `/uploads/products/${slugify(currProd[0].category_name || 'unknown')}/${slugify(currProd[0].name)}`;
        
        const [newCatRows]: any = await connection.query('SELECT name FROM categories WHERE id = ?', [category_id]);
        const newCatName = newCatRows[0]?.name || 'unknown';
        const newRelDir = `/uploads/products/${slugify(newCatName)}/${slugify(name)}`;
        const newAbsDir = path.join(process.cwd(), 'public', newRelDir);

        // 2. Robust Image Migration
        const [existingImages]: any = await connection.query('SELECT id, image_path FROM product_images WHERE product_id = ?', [id]);
        
        await ensureDir(newAbsDir);

        for (const img of existingImages) {
            // Check if image is already in the correct directory
            if (!img.image_path.startsWith(newRelDir)) {
                const oldImgRel = img.image_path;
                const fileName = path.basename(oldImgRel);
                const newImgRel = `${newRelDir}/${fileName}`;
                
                const oldAbs = path.join(process.cwd(), 'public', oldImgRel);
                const newAbs = path.join(process.cwd(), 'public', newImgRel);

                try {
                    // Only move if source exists and destination is different
                    if (oldAbs !== newAbs) {
                        const fs = require('fs/promises');
                        await fs.access(oldAbs);
                        await fs.rename(oldAbs, newAbs);
                        // Update DB with the actual new path
                        await connection.query('UPDATE product_images SET image_path = ? WHERE id = ?', [newImgRel, img.id]);
                    }
                } catch (e) {
                    // If source doesn't exist, maybe it was already moved or deleted
                    // We still try to update DB if it's pointing to a non-existent old location
                    // but it's safer to just log and continue
                    console.warn(`Migration failed for ${oldAbs}:`, (e as Error).message);
                }
            }
        }

        // 3. Check SKU & Slug uniqueness
        if (sku) {
            const [skuRows]: any = await connection.query('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, id]);
            if (skuRows.length > 0) {
                await connection.rollback();
                return NextResponse.json({ message: 'Mã SKU đã tồn tại' }, { status: 400 });
            }
        }
        
        // 4. Update basic info
        await connection.query(
            'UPDATE products SET name = ?, sku = ?, slug = ?, category_id = ?, price = ?, discount_price = ?, description = ?, stock = ?, is_active = ? WHERE id = ?',
            [name, sku, slug, category_id, price, discount_price, description, stock, is_active, id]
        );

        // 5. Handle deletions
        for (const imgId of deleteImageIds) {
            const [rows]: any = await connection.query('SELECT image_path, is_primary FROM product_images WHERE id = ? AND product_id = ?', [imgId, id]);
            if (rows.length > 0) {
                const isPrimaryToDelete = rows[0].is_primary;
                await deleteFile(rows[0].image_path);
                await connection.query('DELETE FROM product_images WHERE id = ?', [imgId]);

                if (isPrimaryToDelete) {
                    await connection.query(
                        'UPDATE product_images SET is_primary = 1 WHERE product_id = ? ORDER BY id ASC LIMIT 1',
                        [id]
                    );
                }
            }
        }

        // 6. Handle new uploads
        if (newImages.length > 0) {
            await ensureDir(newAbsDir);
            const [orderRows]: any = await connection.query('SELECT MAX(display_order) as maxOrder FROM product_images WHERE product_id = ?', [id]);
            let nextOrder = (orderRows[0].maxOrder || 0) + 1;

            for (let i = 0; i < newImages.length; i++) {
                const file = newImages[i];
                if (file.size === 0) continue;
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = `${Date.now()}-${i}-${file.name.replace(/\s+/g, '_')}`;
                const relativePath = `${newRelDir}/${filename}`;
                await writeFile(path.join(newAbsDir, filename), buffer);
                await connection.query(
                    'INSERT INTO product_images (product_id, image_path, is_primary, display_order) VALUES (?, ?, ?, ?)',
                    [id, relativePath, 0, nextOrder++]
                );
            }
        }

        // 7. Update Primary Status
        if (primaryImageId) {
            await connection.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [id]);
            await connection.query('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?', [primaryImageId, id]);
        }

        // 8. Handle Variants
        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
        for (const v of variants) {
            const vSku = (v.sku && v.sku.trim() !== '') ? v.sku.trim() : null;
            await connection.query(
                'INSERT INTO product_variants (product_id, size, color, sku, stock, price_override) VALUES (?, ?, ?, ?, ?, ?)',
                [id, v.size, v.color, vSku, v.stock || 0, v.price_override || null]
            );
        }

        await connection.commit();
        return NextResponse.json({ message: 'Cập nhật thành công' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Update Detail Error:', error);
        return NextResponse.json({ message: 'Lỗi máy chủ: ' + (error as Error).message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Separate PATCH for handling image status changes (Primary selection)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    const connection = await pool.getConnection();
    try {
        const { id } = params;
        const { action, image_id } = await req.json();

        if (action === 'set_primary') {
            await connection.beginTransaction();
            // Reset all
            await connection.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [id]);
            // Set new primary
            const [result]: any = await connection.query(
                'UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?',
                [image_id, id]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return NextResponse.json({ message: 'Ảnh không đúng hoặc không tồn tại' }, { status: 404 });
            }

            await connection.commit();
            return NextResponse.json({ message: 'Đã đặt làm ảnh chính' });
        }

        if (action === 'reorder') {
            const { image_ids } = await req.json(); // Array of image IDs in new order
            await connection.beginTransaction();
            for (let i = 0; i < image_ids.length; i++) {
                await connection.query(
                    'UPDATE product_images SET display_order = ? WHERE id = ? AND product_id = ?',
                    [i, image_ids[i], id]
                );
            }
            await connection.commit();
            return NextResponse.json({ message: 'Đã cập nhật thứ tự hình ảnh' });
        }

        return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });
    } catch (error) {
        if (connection) await connection.rollback();
        return NextResponse.json({ message: 'Lỗi internal server' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    const connection = await pool.getConnection();
    try {
        const { id } = params;
        const [images]: any = await connection.query('SELECT image_path FROM product_images WHERE product_id = ?', [id]);
        await connection.beginTransaction();
        for (const img of images) {
            await deleteFile(img.image_path);
        }
        await connection.query('DELETE FROM products WHERE id = ?', [id]);
        await connection.commit();
        return NextResponse.json({ message: 'Đã xóa vĩnh viễn' });
    } catch (error) {
        if (connection) await connection.rollback();
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
