import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        const { status } = await req.json();
        const { id } = params;

        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        
        return NextResponse.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi khi cập nhật' }, { status: 500 });
    }
}
