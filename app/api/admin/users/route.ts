import { authorize } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager'], sid);
    if (errorResponse) return errorResponse;

    try {
        const [rows]: any = await pool.query('SELECT id, username, email, role, is_locked, created_at FROM users ORDER BY created_at DESC');
        return NextResponse.json({ users: rows });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    // SECURITY: Only Admin can change roles or lock accounts
    const { errorResponse } = await authorize(['admin'], sid);
    if (errorResponse) return errorResponse;

    try {
        const { id, role, is_locked } = await req.json();

        await pool.query(
            'UPDATE users SET role = ?, is_locked = ? WHERE id = ?',
            [role, is_locked, id]
        );

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
