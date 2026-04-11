import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Fetch orders with user fullname for better context
        const [rows]: any = await pool.query(`
            SELECT o.*, u.fullname, u.phone as user_phone 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        return NextResponse.json({ orders: rows });
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi khi tải đơn hàng' }, { status: 500 });
    }
}
