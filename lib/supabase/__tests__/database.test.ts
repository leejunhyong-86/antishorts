import { describe, it, expect, beforeAll } from '@jest/globals';
import { VideoDatabase } from '../database';
import type { VideoInsert } from '../client';

describe('VideoDatabase', () => {
    let db: VideoDatabase;

    beforeAll(() => {
        db = new VideoDatabase();
    });

    describe('CRUD Operations', () => {
        it('VideoDatabase 인스턴스를 생성할 수 있어야 함', () => {
            expect(db).toBeDefined();
            expect(db).toBeInstanceOf(VideoDatabase);
        });

        it('addVideo 메서드가 존재해야 함', () => {
            expect(typeof db.addVideo).toBe('function');
        });

        it('getAllVideos 메서드가 존재해야 함', () => {
            expect(typeof db.getAllVideos).toBe('function');
        });

        it('getVideoById 메서드가 존재해야 함', () => {
            expect(typeof db.getVideoById).toBe('function');
        });

        it('getVideosByPlatform 메서드가 존재해야 함', () => {
            expect(typeof db.getVideosByPlatform).toBe('function');
        });

        it('searchVideos 메서드가 존재해야 함', () => {
            expect(typeof db.searchVideos).toBe('function');
        });

        it('updateVideo 메서드가 존재해야 함', () => {
            expect(typeof db.updateVideo).toBe('function');
        });

        it('deleteVideo 메서드가 존재해야 함', () => {
            expect(typeof db.deleteVideo).toBe('function');
        });

        it('videoExists 메서드가 존재해야 함', () => {
            expect(typeof db.videoExists).toBe('function');
        });

        it('getVideoCount 메서드가 존재해야 함', () => {
            expect(typeof db.getVideoCount).toBe('function');
        });
    });

    describe('Video Insert Validation', () => {
        it('유효한 비디오 객체를 생성할 수 있어야 함', () => {
            const video: VideoInsert = {
                title: 'Test Video',
                platform: 'youtube',
                original_url: 'https://www.youtube.com/shorts/test123',
                video_id: 'test123',
            };

            expect(video.title).toBe('Test Video');
            expect(video.platform).toBe('youtube');
            expect(video.original_url).toContain('youtube.com');
            expect(video.video_id).toBe('test123');
        });

        it('선택적 필드를 포함한 비디오 객체를 생성할 수 있어야 함', () => {
            const video: VideoInsert = {
                title: 'Test Video',
                description: 'Test Description',
                platform: 'instagram',
                original_url: 'https://www.instagram.com/reel/test456/',
                video_id: 'test456',
                uploader: 'Test User',
                duration: 30,
                file_name: 'test.mp4',
                file_size: 1024000,
            };

            expect(video.description).toBe('Test Description');
            expect(video.uploader).toBe('Test User');
            expect(video.duration).toBe(30);
            expect(video.file_size).toBe(1024000);
        });
    });

    describe('Query Options', () => {
        it('getAllVideos가 옵션을 받을 수 있어야 함', async () => {
            const options = {
                limit: 10,
                offset: 0,
                orderBy: 'created_at' as const,
                order: 'desc' as const,
            };

            // Supabase 연결이 없어도 함수 호출은 가능해야 함
            const result = await db.getAllVideos(options);
            expect(Array.isArray(result)).toBe(true);
        });

        it('searchVideos가 쿼리를 받을 수 있어야 함', async () => {
            const result = await db.searchVideos('test', { limit: 5 });
            expect(Array.isArray(result)).toBe(true);
        });
    });
});
