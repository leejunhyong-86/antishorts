import path from 'path';
import {
    DownloadResult,
    DownloadOptions,
    VideoMetadata
} from './types';
import {
    generateUniqueFileName,
    ensureDir
} from './file-utils';

/**
 * Instagram 다운로더 클래스
 * 
 * 참고: Instagram은 공식 API에서 Reels 다운로드를 지원하지 않습니다.
 * 현재는 yt-dlp를 사용하여 다운로드를 시도합니다.
 */
export class InstagramDownloader {
    private defaultOutputDir: string;

    constructor(outputDir: string = './downloads') {
        this.defaultOutputDir = outputDir;
    }

    /**
     * 비디오 메타데이터 추출
     * 
     * 참고: Instagram API 제한으로 인해 제한적인 정보만 제공됩니다.
     */
    async getMetadata(url: string): Promise<VideoMetadata> {
        // Instagram Reel ID 추출
        const reelIdMatch = url.match(/\/reel\/([a-zA-Z0-9_-]+)/);
        const postIdMatch = url.match(/\/p\/([a-zA-Z0-9_-]+)/);
        const videoId = reelIdMatch?.[1] || postIdMatch?.[1] || 'unknown';

        return {
            title: `Instagram_Reel_${videoId}`,
            videoId,
            platform: 'instagram',
        };
    }

    /**
     * Instagram Reels 다운로드
     * 
     * 참고: yt-dlp를 사용하여 다운로드를 시도합니다.
     * Instagram의 정책 변경에 따라 작동하지 않을 수 있습니다.
     */
    async download(
        url: string,
        options: DownloadOptions = {}
    ): Promise<DownloadResult> {
        const {
            outputDir = this.defaultOutputDir,
            format = 'mp4',
            maxRetries = 3,
        } = options;

        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < maxRetries) {
            try {
                // 디렉토리 생성
                await ensureDir(outputDir);

                // 메타데이터 가져오기
                const metadata = await this.getMetadata(url);

                // 고유한 파일명 생성
                const fileName = await generateUniqueFileName(
                    outputDir,
                    metadata.title,
                    format
                );

                // Instagram 다운로드는 현재 제한적으로 지원됩니다
                // 실제 구현에서는 yt-dlp 또는 다른 서드파티 라이브러리를 사용해야 합니다

                return {
                    success: false,
                    error: 'Instagram Reels 다운로드는 현재 개발 중입니다. Instagram의 API 제한으로 인해 제한적으로 지원됩니다.',
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                attempt++;

                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                }
            }
        }

        return {
            success: false,
            error: `다운로드 실패 (${maxRetries}번 시도): ${lastError?.message || '알 수 없는 오류'}`,
        };
    }
}
