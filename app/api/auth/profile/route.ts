import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { writeFile } from 'fs/promises';
import { slugify, ensureDir, deleteFile } from '@/lib/fileUtils';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Fetch current user full profile
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const token = cookies().get(sid ? `auth_token_s${sid}` : 'auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.id;

        const [rows]: any = await pool.query(
            'SELECT username, email, fullname, phone, address, role, avatar FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json({ profile: rows[0] });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// Update profile (Hỗ trợ Multipart cho Avatar)
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const token = cookies().get(sid ? `auth_token_s${sid}` : 'auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.id;

        const formData = await req.formData();
        const fullname = formData.get('fullname') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const avatarFile = formData.get('avatar') as File | null;

        // 1. Lấy thông tin hiện tại (để lấy username và avatar cũ)
        const [userRows]: any = await pool.query('SELECT username, avatar FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        
        const username = userRows[0].username;
        const oldAvatar = userRows[0].avatar;
        let avatarPath = oldAvatar;

        // 2. Xử lý upload avatar mới nếu có
        if (avatarFile && avatarFile.size > 0) {
            const userSlug = slugify(username);
            const relativeDir = `/uploads/avt/${userSlug}`;
            const uploadDir = path.join(process.cwd(), 'public', relativeDir);
            
            await ensureDir(uploadDir);

            // Xóa avatar cũ nếu tồn tại
            if (oldAvatar) {
                await deleteFile(oldAvatar);
            }

            const bytes = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${avatarFile.name.replace(/\s+/g, '_')}`;
            const filePath = path.join(uploadDir, filename);
            avatarPath = `${relativeDir}/${filename}`;
            
            await writeFile(filePath, buffer);
        }

        // 3. Cập nhật DB
        await pool.query(
            'UPDATE users SET fullname = ?, phone = ?, address = ?, avatar = ? WHERE id = ?',
            [fullname, phone, address, avatarPath, userId]
        );

        return NextResponse.json({ 
            message: 'Thông tin cá nhân đã được cập nhật',
            avatar: avatarPath 
        });
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ message: 'Lỗi server: ' + error.message }, { status: 500 });
    }
}
