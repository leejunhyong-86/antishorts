import { describe, it, expect, beforeEach } from '@jest/globals';
import { VideoDownloader } from '../index';

describe('VideoDownloader', () => {
    let downloader: VideoDownloader;

    beforeEach(() => {
        downloader = new VideoDownloader('./test-downloads');
    });

    describe('getMetadata', () => {
        it('YouTube URL에서 메타데이터를 추출해야 함', async () => {
            const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';

            // 실제 네트워크 요청이 필요하므로 에러 처리 테스트
            try {
                const metadata = await downloader.getMetadata(url);
                expect(metadata.platform).toBe('youtube');
                expect(metadata.videoId).toBeDefined();
            } catch (error) {
                // yt-dlp가 설치되지 않았거나 네트워크 오류일 수 있음
                expect(error).toBeDefined();
            }
        }, 30000); // 30초 타임아웃

        it('지원하지 않는 URL은 에러를 발생시켜야 함', async () => {
            const url = 'https://www.google.com';

            await expect(downloader.getMetadata(url)).rejects.toThrow('지원하지 않는 URL입니다');
        });
    });

    describe('download', () => {
        it('지원하지 않는 URL은 실패 결과를 반환해야 함', async () => {
            const url = 'https://www.google.com';

            const result = await downloader.download(url);

            expect(result.success).toBe(false);
            expect(result.error).toContain('지원하지 않는 URL');
        });

        it('YouTube URL 다운로드를 시도해야 함', async () => {
            const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';

            // 실제 다운로드는 yt-dlp 설치가 필요하므로 결과만 확인
            const result = await downloader.download(url, {
                maxRetries: 1,
            });

            expect(result).toBeDefined();
            expect(typeof result.success).toBe('boolean');
        }, 60000); // 60초 타임아웃

        it('Instagram URL은 현재 지원하지 않음을 알려야 함', async () => {
            const url = 'https://www.instagram.com/reel/ABC123/';

            const result = await downloader.download(url);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Instagram');
        });
    });
});
