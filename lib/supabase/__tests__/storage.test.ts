import { describe, it, expect } from '@jest/globals';
import { StorageManager } from '../storage';

describe('StorageManager', () => {
    let storage: StorageManager;

    beforeEach(() => {
        storage = new StorageManager('videos');
    });

    describe('Initialization', () => {
        it('StorageManager 인스턴스를 생성할 수 있어야 함', () => {
            expect(storage).toBeDefined();
            expect(storage).toBeInstanceOf(StorageManager);
        });

        it('커스텀 버킷 이름으로 생성할 수 있어야 함', () => {
            const customStorage = new StorageManager('custom-bucket');
            expect(customStorage).toBeDefined();
        });
    });

    describe('Path Generation', () => {
        it('저장 경로를 올바르게 생성해야 함', () => {
            const path = storage.generateStoragePath('youtube', 'test.mp4', 'video');

            expect(path).toContain('youtube');
            expect(path).toContain('video');
            expect(path).toContain('test.mp4');
            expect(path).toMatch(/\d{4}\/\d{2}\/\d{2}/); // YYYY/MM/DD 패턴
        });

        it('썸네일 경로를 올바르게 생성해야 함', () => {
            const path = storage.generateStoragePath('instagram', 'thumb.jpg', 'thumbnail');

            expect(path).toContain('instagram');
            expect(path).toContain('thumbnail');
            expect(path).toContain('thumb.jpg');
        });

        it('플랫폼별로 다른 경로를 생성해야 함', () => {
            const youtubePath = storage.generateStoragePath('youtube', 'video.mp4');
            const instagramPath = storage.generateStoragePath('instagram', 'video.mp4');

            expect(youtubePath).toContain('youtube');
            expect(instagramPath).toContain('instagram');
            expect(youtubePath).not.toEqual(instagramPath);
        });
    });

    describe('URL Path Extraction', () => {
        it('URL에서 경로를 추출할 수 있어야 함', () => {
            const url = 'https://example.supabase.co/storage/v1/object/public/videos/youtube/2024/01/12/video/test.mp4';
            const path = storage.extractPathFromUrl(url);

            expect(path).toBe('youtube/2024/01/12/video/test.mp4');
        });

        it('잘못된 URL은 null을 반환해야 함', () => {
            const path = storage.extractPathFromUrl('invalid-url');
            expect(path).toBe(null);
        });

        it('버킷 이름이 없는 URL은 null을 반환해야 함', () => {
            const url = 'https://example.com/some/path/file.mp4';
            const path = storage.extractPathFromUrl(url);
            expect(path).toBe(null);
        });
    });

    describe('Methods Existence', () => {
        it('ensureBucket 메서드가 존재해야 함', () => {
            expect(typeof storage.ensureBucket).toBe('function');
        });

        it('uploadFile 메서드가 존재해야 함', () => {
            expect(typeof storage.uploadFile).toBe('function');
        });

        it('uploadThumbnail 메서드가 존재해야 함', () => {
            expect(typeof storage.uploadThumbnail).toBe('function');
        });

        it('deleteFile 메서드가 존재해야 함', () => {
            expect(typeof storage.deleteFile).toBe('function');
        });
    });
});
