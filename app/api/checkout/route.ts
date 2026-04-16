import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const token = cookies().get(sid ? `auth_token_s${sid}` : 'auth_token')?.value;
    let userId = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.id;
        } catch (e) {
            // Token invalid - allow guest checkout if needed, but here we prefer authenticated
        }
    }

    const { items, address, phone, paymentMethod, totalAmount } = await req.json();

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create order header
        const [orderResult]: any = await connection.query(
            'INSERT INTO orders (user_id, total_price, address, phone, payment_method) VALUES (?, ?, ?, ?, ?)',
            [userId, totalAmount, address, phone, paymentMethod]
        );
        const orderId = orderResult.insertId;

        // 2. Create order items and Update Stock
        for (const item of items) {
            if (item.variantId) {
                // Check variant stock
                const [varRows]: any = await connection.query('SELECT stock FROM product_variants WHERE id = ? FOR UPDATE', [item.variantId]);
                if (varRows.length === 0 || varRows[0].stock < item.quantity) {
                    throw new Error(`Sản phẩm ${item.name} (biến thể) không đủ hàng trong kho.`);
                }
                // Update variant stock
                await connection.query(
                    'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.variantId]
                );
            } else {
                // Check main product stock
                const [productRows]: any = await connection.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [item.id]);
                if (productRows.length === 0 || productRows[0].stock < item.quantity) {
                    throw new Error(`Sản phẩm ${item.name} không đủ hàng trong kho.`);
                }
                // Update main product stock
                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.id]
                );
            }

            // Insert item
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price] // in the future, maybe add variant_id to order_items
            );
        }

        await connection.commit();
        return NextResponse.json({ message: 'Đặt hàng thành công', orderId }, { status: 201 });

    } catch (error: any) {
        await connection.rollback();
        console.error('Checkout Error:', error);
        return NextResponse.json({ message: error.message || 'Lỗi hệ thống khi đặt hàng' }, { status: 500 });
    } finally {
        connection.release();
    }
}
