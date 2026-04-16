import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query = `
            SELECT o.*, u.fullname, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.status = "completed"
        `;
        const params: any[] = [];

        if (startDate && endDate) {
            query += ' AND o.created_at BETWEEN ? AND ?';
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        query += ' ORDER BY o.created_at DESC';

        const [rows]: any = await pool.query(query, params);
        
        // Calculate totals
        const totalRevenue = rows.reduce((sum: number, order: any) => sum + parseFloat(order.total_price), 0);
        const orderCount = rows.length;

        return NextResponse.json({ 
            orders: rows,
            summary: {
                totalRevenue,
                orderCount
            }
        });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
