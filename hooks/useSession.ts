'use client';
import { useSearchParams } from 'next/navigation';

export function useSession() {
    const searchParams = useSearchParams();
    const sid = searchParams.get('sid');

    /**
     * Appends the current sid to any URL string.
     */
    const sessionUrl = (url: string) => {
        if (!sid) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}sid=${sid}`;
    };

    /**
     * Helper to navigate or use sid in fetch calls.
     */
    return { sid, sessionUrl };
}
