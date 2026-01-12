import { describe, it, expect } from '@jest/globals';
import {
    detectPlatform,
    extractYouTubeVideoId,
    extractInstagramReelId,
    validateURL,
    normalizeURL,
} from '../url-validator';

describe('URL Validator', () => {
    describe('detectPlatform', () => {
        it('YouTube Shorts URL을 감지해야 함', () => {
            expect(detectPlatform('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('youtube');
            expect(detectPlatform('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('youtube');
            expect(detectPlatform('https://m.youtube.com/shorts/dQw4w9WgXcQ')).toBe('youtube');
            expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
        });

        it('Instagram Reels URL을 감지해야 함', () => {
            expect(detectPlatform('https://www.instagram.com/reel/ABC123def45/')).toBe('instagram');
            expect(detectPlatform('https://instagram.com/reel/ABC123def45/')).toBe('instagram');
            expect(detectPlatform('https://www.instagram.com/p/ABC123def45/')).toBe('instagram');
        });

        it('지원하지 않는 URL은 null을 반환해야 함', () => {
            expect(detectPlatform('https://www.google.com')).toBe(null);
            expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(null);
            expect(detectPlatform('https://twitter.com/user/status/123')).toBe(null);
        });

        it('빈 문자열이나 잘못된 입력은 null을 반환해야 함', () => {
            expect(detectPlatform('')).toBe(null);
            expect(detectPlatform('   ')).toBe(null);
        });
    });

    describe('extractYouTubeVideoId', () => {
        it('YouTube Shorts URL에서 비디오 ID를 추출해야 함', () => {
            expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
            expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        });

        it('쿼리 파라미터가 있어도 비디오 ID를 추출해야 함', () => {
            expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share')).toBe('dQw4w9WgXcQ');
        });

        it('잘못된 URL은 null을 반환해야 함', () => {
            expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(null);
            expect(extractYouTubeVideoId('https://www.google.com')).toBe(null);
        });
    });

    describe('extractInstagramReelId', () => {
        it('Instagram Reels URL에서 Reel ID를 추출해야 함', () => {
            expect(extractInstagramReelId('https://www.instagram.com/reel/ABC123def45/')).toBe('ABC123def45');
            expect(extractInstagramReelId('https://www.instagram.com/p/ABC123def45/')).toBe('ABC123def45');
        });

        it('슬래시 없이도 Reel ID를 추출해야 함', () => {
            expect(extractInstagramReelId('https://www.instagram.com/reel/ABC123def45')).toBe('ABC123def45');
        });

        it('잘못된 URL은 null을 반환해야 함', () => {
            expect(extractInstagramReelId('https://www.instagram.com/user/')).toBe(null);
            expect(extractInstagramReelId('https://www.google.com')).toBe(null);
        });
    });

    describe('validateURL', () => {
        it('유효한 YouTube Shorts URL을 검증해야 함', () => {
            const result = validateURL('https://www.youtube.com/shorts/dQw4w9WgXcQ');
            expect(result.isValid).toBe(true);
            expect(result.platform).toBe('youtube');
            expect(result.videoId).toBe('dQw4w9WgXcQ');
            expect(result.error).toBeUndefined();
        });

        it('유효한 Instagram Reels URL을 검증해야 함', () => {
            const result = validateURL('https://www.instagram.com/reel/ABC123def45/');
            expect(result.isValid).toBe(true);
            expect(result.platform).toBe('instagram');
            expect(result.videoId).toBe('ABC123def45');
            expect(result.error).toBeUndefined();
        });

        it('빈 URL은 에러를 반환해야 함', () => {
            const result = validateURL('');
            expect(result.isValid).toBe(false);
            expect(result.platform).toBe(null);
            expect(result.error).toBe('URL을 입력해주세요.');
        });

        it('http/https로 시작하지 않는 URL은 에러를 반환해야 함', () => {
            const result = validateURL('www.youtube.com/shorts/dQw4w9WgXcQ');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('URL은 http:// 또는 https://로 시작해야 합니다.');
        });

        it('지원하지 않는 URL은 에러를 반환해야 함', () => {
            const result = validateURL('https://www.google.com');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('지원하지 않는 URL 형식입니다');
        });
    });

    describe('normalizeURL', () => {
        it('YouTube URL을 정규화해야 함', () => {
            expect(normalizeURL('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe('https://www.youtube.com/shorts/dQw4w9WgXcQ');
            expect(normalizeURL('https://m.youtube.com/shorts/dQw4w9WgXcQ')).toBe('https://www.youtube.com/shorts/dQw4w9WgXcQ');
        });

        it('Instagram URL을 정규화해야 함', () => {
            expect(normalizeURL('https://instagram.com/reel/ABC123def45')).toBe('https://www.instagram.com/reel/ABC123def45/');
            expect(normalizeURL('https://www.instagram.com/p/ABC123def45/')).toBe('https://www.instagram.com/reel/ABC123def45/');
        });

        it('지원하지 않는 URL은 그대로 반환해야 함', () => {
            const url = 'https://www.google.com';
            expect(normalizeURL(url)).toBe(url);
        });
    });
});
