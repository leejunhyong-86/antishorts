import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * 안전한 파일명 생성 (특수문자 제거)
 */
export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // 윈도우 금지 문자 제거
        .replace(/\s+/g, '_') // 공백을 언더스코어로
        .replace(/\.+/g, '.') // 연속된 점 제거
        .substring(0, 200); // 최대 길이 제한
}

/**
 * 고유한 파일명 생성 (중복 방지)
 */
export async function generateUniqueFileName(
    baseDir: string,
    baseName: string,
    extension: string
): Promise<string> {
    const sanitized = sanitizeFileName(baseName);
    let fileName = `${sanitized}.${extension}`;
    let filePath = path.join(baseDir, fileName);
    let counter = 1;

    // 파일이 존재하면 숫자 추가
    while (existsSync(filePath)) {
        fileName = `${sanitized}_${counter}.${extension}`;
        filePath = path.join(baseDir, fileName);
        counter++;
    }

    return fileName;
}

/**
 * 디렉토리 생성 (존재하지 않으면)
 */
export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

/**
 * 파일 크기 가져오기
 */
export async function getFileSize(filePath: string): Promise<number> {
    try {
        const stats = await fs.stat(filePath);
        return stats.size;
    } catch {
        return 0;
    }
}

/**
 * 파일 삭제
 */
export async function deleteFile(filePath: string): Promise<boolean> {
    try {
        await fs.unlink(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * 바이트를 읽기 쉬운 형식으로 변환
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 초를 읽기 쉬운 시간 형식으로 변환
 */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
