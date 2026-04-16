import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface AuthPayload {
    id: number;
    username: string;
    role: string;
    email: string;
}

/**
 * Verifies the JWT token from cookies and returns the payload if valid.
 */
export async function getAuthUser(sid?: string | null): Promise<AuthPayload | null> {
    const cookieName = sid ? `auth_token_s${sid}` : 'auth_token';
    const token = cookies().get(cookieName)?.value;
    
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as AuthPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Higher-level helper for API routes. 
 * Checks if user is logged in and HAS one of the allowed roles.
 */
export async function authorize(allowedRoles: string[], sid?: string | null) {
    const user = await getAuthUser(sid);
    
    if (!user) {
        return {
            user: null,
            errorResponse: NextResponse.json({ message: 'Unauthorized: Please login' }, { status: 401 })
        };
    }

    if (!allowedRoles.includes(user.role)) {
        return {
            user: null,
            errorResponse: NextResponse.json({ 
                message: `Forbidden: Access denied for role ${user.role}` 
            }, { status: 403 })
        };
    }

    return { user, errorResponse: null };
}
