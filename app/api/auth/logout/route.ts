import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const cookieName = sid ? `auth_token_s${sid}` : 'auth_token';

    const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
    
    // Clear the specific session cookie
    response.cookies.set(cookieName, '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    return response;
}
