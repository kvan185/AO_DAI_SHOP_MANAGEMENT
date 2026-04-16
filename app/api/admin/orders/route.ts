import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    
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
