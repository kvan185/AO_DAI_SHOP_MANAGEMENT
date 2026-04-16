import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        return NextResponse.json({ coupons: rows });
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
        const { code, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit } = await req.json();
        
        if (!code || !discount_type || !discount_value) {
            return NextResponse.json({ message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        await pool.query(
            'INSERT INTO coupons (code, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [code, discount_type, discount_value, min_order_value || 0, start_date || null, end_date || null, usage_limit || null]
        );

        return NextResponse.json({ message: 'Tạo mã giảm giá thành công' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: 'Mã giảm giá này đã tồn tại' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
