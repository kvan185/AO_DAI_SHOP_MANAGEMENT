import { authorize } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        // 1. Total Revenue
        const [revenueRows]: any = await pool.query('SELECT SUM(total_price) as total FROM orders WHERE status = "completed"');
        const totalRevenue = revenueRows[0].total || 0;

        // 2. New Orders
        const [orderRows]: any = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        const newOrders = orderRows[0].count || 0;

        // 3. Customers
        const [customerRows]: any = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        const totalCustomers = customerRows[0].count || 0;

        // 4. Low Stock Products
        const [stockRows]: any = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 5 AND is_active = TRUE');
        const lowStockCount = stockRows[0].count || 0;

        // 5. Revenue by Month (Last 6 months)
        const [chartRows]: any = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b %Y') as month,
                SUM(total_price) as revenue
            FROM orders
            WHERE status != 'cancelled'
            GROUP BY month
            ORDER BY created_at ASC
            LIMIT 6
        `);

        // 6. Recent Orders
        const [recentOrderRows]: any = await pool.query(`
            SELECT o.*, u.fullname 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT 5
        `);

        return NextResponse.json({
            stats: {
                totalRevenue,
                newOrders,
                totalCustomers,
                lowStockCount
            },
            chartData: chartRows,
            recentOrders: recentOrderRows
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
