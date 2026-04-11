import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { status } = await req.json();
        const { id } = params;

        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        
        return NextResponse.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi khi cập nhật' }, { status: 500 });
    }
}
