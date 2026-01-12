import { describe, it, expect } from '@jest/globals';
import {
    sanitizeFileName,
    formatBytes,
    formatDuration,
} from '../file-utils';

describe('File Utils', () => {
    describe('sanitizeFileName', () => {
        it('특수문자를 제거해야 함', () => {
            expect(sanitizeFileName('test<>:"/\\|?*file.mp4')).toBe('testfile.mp4');
        });

        it('공백을 언더스코어로 변환해야 함', () => {
            expect(sanitizeFileName('my video file.mp4')).toBe('my_video_file.mp4');
        });

        it('연속된 점을 제거해야 함', () => {
            expect(sanitizeFileName('test...file.mp4')).toBe('test.file.mp4');
        });

        it('최대 길이를 제한해야 함', () => {
            const longName = 'a'.repeat(300) + '.mp4';
            const result = sanitizeFileName(longName);
            expect(result.length).toBeLessThanOrEqual(200);
        });

        it('일반 파일명은 그대로 유지해야 함', () => {
            expect(sanitizeFileName('normal_file.mp4')).toBe('normal_file.mp4');
        });
    });

    describe('formatBytes', () => {
        it('0 바이트를 올바르게 포맷해야 함', () => {
            expect(formatBytes(0)).toBe('0 Bytes');
        });

        it('바이트를 올바르게 포맷해야 함', () => {
            expect(formatBytes(500)).toBe('500 Bytes');
        });

        it('킬로바이트를 올바르게 포맷해야 함', () => {
            expect(formatBytes(1024)).toBe('1 KB');
            expect(formatBytes(1536)).toBe('1.5 KB');
        });

        it('메가바이트를 올바르게 포맷해야 함', () => {
            expect(formatBytes(1048576)).toBe('1 MB');
            expect(formatBytes(5242880)).toBe('5 MB');
        });

        it('기가바이트를 올바르게 포맷해야 함', () => {
            expect(formatBytes(1073741824)).toBe('1 GB');
        });
    });

    describe('formatDuration', () => {
        it('초만 있는 경우를 올바르게 포맷해야 함', () => {
            expect(formatDuration(30)).toBe('0:30');
            expect(formatDuration(5)).toBe('0:05');
        });

        it('분과 초를 올바르게 포맷해야 함', () => {
            expect(formatDuration(90)).toBe('1:30');
            expect(formatDuration(125)).toBe('2:05');
        });

        it('시간, 분, 초를 올바르게 포맷해야 함', () => {
            expect(formatDuration(3661)).toBe('1:01:01');
            expect(formatDuration(7200)).toBe('2:00:00');
        });

        it('0초를 올바르게 포맷해야 함', () => {
            expect(formatDuration(0)).toBe('0:00');
        });
    });
});
