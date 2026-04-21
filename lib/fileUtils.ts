import { mkdir, rename, access, unlink } from 'fs/promises';
import path from 'path';

/**
 * Chuyển đổi tên sản phẩm/danh mục sang dạng slug an toàn cho tên thư mục
 */
export function slugify(str: string): string {
    if (!str) return 'unnamed';
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    str = str.replace(/([^0-9a-z-\s])/g, '');
    str = str.replace(/(\s+)/g, '-');
    str = str.replace(/-+/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    return str || 'unnamed';
}

/**
 * Đảm bảo thư mục tồn tại, nếu không sẽ tạo mới
 */
export async function ensureDir(dirPath: string) {
    await mkdir(dirPath, { recursive: true });
}

/**
 * Đổi tên thư mục nếu tồn tại
 */
export async function renameFolder(oldDir: string, newDir: string) {
    try {
        await access(oldDir);
        // Đảm bảo thư mục cha của đích tồn tại
        await ensureDir(path.dirname(newDir));
        await rename(oldDir, newDir);
        return true;
    } catch (error) {
        // Thư mục cũ không tồn tại hoặc lỗi khác
        return false;
    }
}

/**
 * Xóa file cụ thể
 */
export async function deleteFile(filePath: string) {
    try {
        const absolutePath = path.join(process.cwd(), 'public', filePath);
        await unlink(absolutePath);
        return true;
    } catch (error) {
        return false;
    }
}
