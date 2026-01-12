import { supabase } from './client';
import path from 'path';
import fs from 'fs/promises';

/**
 * Supabase Storage 관리 클래스
 */
export class StorageManager {
    private bucketName: string;

    constructor(bucketName: string = 'videos') {
        this.bucketName = bucketName;
    }

    /**
     * 버킷 생성 (이미 존재하면 무시)
     */
    async ensureBucket(): Promise<boolean> {
        try {
            const { data: buckets } = await supabase.storage.listBuckets();

            const bucketExists = buckets?.some(b => b.name === this.bucketName);

            if (!bucketExists) {
                const { error } = await supabase.storage.createBucket(this.bucketName, {
                    public: true, // 비디오 재생을 위해 public 설정
                    fileSizeLimit: 524288000, // 500MB
                });

                if (error) {
                    console.error('버킷 생성 오류:', error);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('버킷 확인 예외:', error);
            return false;
        }
    }

    /**
     * 파일 업로드
     */
    async uploadFile(
        filePath: string,
        storagePath: string
    ): Promise<string | null> {
        try {
            // 파일 읽기
            const fileBuffer = await fs.readFile(filePath);

            // 파일 업로드
            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: 'video/mp4',
                    upsert: true,
                });

            if (error) {
                console.error('파일 업로드 오류:', error);
                return null;
            }

            // 공개 URL 생성
            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch (error) {
            console.error('파일 업로드 예외:', error);
            return null;
        }
    }

    /**
     * 썸네일 업로드
     */
    async uploadThumbnail(
        thumbnailPath: string,
        storagePath: string
    ): Promise<string | null> {
        try {
            const fileBuffer = await fs.readFile(thumbnailPath);

            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (error) {
                console.error('썸네일 업로드 오류:', error);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch (error) {
            console.error('썸네일 업로드 예외:', error);
            return null;
        }
    }

    /**
     * 파일 삭제
     */
    async deleteFile(storagePath: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([storagePath]);

            if (error) {
                console.error('파일 삭제 오류:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('파일 삭제 예외:', error);
            return false;
        }
    }

    /**
     * 파일 URL에서 경로 추출
     */
    extractPathFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const bucketIndex = pathParts.indexOf(this.bucketName);

            if (bucketIndex === -1) return null;

            return pathParts.slice(bucketIndex + 1).join('/');
        } catch {
            return null;
        }
    }

    /**
     * 저장 경로 생성 (플랫폼/날짜/파일명)
     */
    generateStoragePath(
        platform: string,
        fileName: string,
        type: 'video' | 'thumbnail' = 'video'
    ): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${platform}/${year}/${month}/${day}/${type}/${fileName}`;
    }
}

// 싱글톤 인스턴스
export const storage = new StorageManager();
