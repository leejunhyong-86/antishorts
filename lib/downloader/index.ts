import { detectPlatform } from '../url-validator';
import { YouTubeDownloader } from './youtube-downloader';
import { InstagramDownloader } from './instagram-downloader';
import { DownloadResult, DownloadOptions, VideoMetadata } from './types';

/**
 * 통합 다운로더 클래스
 * URL을 분석하여 적절한 다운로더를 선택합니다
 */
export class VideoDownloader {
    private youtubeDownloader: YouTubeDownloader;
    private instagramDownloader: InstagramDownloader;

    constructor(outputDir: string = './downloads') {
        this.youtubeDownloader = new YouTubeDownloader(outputDir);
        this.instagramDownloader = new InstagramDownloader(outputDir);
    }

    /**
     * URL에서 비디오 메타데이터 추출
     */
    async getMetadata(url: string): Promise<VideoMetadata> {
        const platform = detectPlatform(url);

        if (!platform) {
            throw new Error('지원하지 않는 URL입니다.');
        }

        switch (platform) {
            case 'youtube':
                return this.youtubeDownloader.getMetadata(url);
            case 'instagram':
                return this.instagramDownloader.getMetadata(url);
            default:
                throw new Error(`지원하지 않는 플랫폼: ${platform}`);
        }
    }

    /**
     * URL에서 비디오 다운로드
     */
    async download(url: string, options: DownloadOptions = {}): Promise<DownloadResult> {
        const platform = detectPlatform(url);

        if (!platform) {
            return {
                success: false,
                error: '지원하지 않는 URL입니다. YouTube Shorts 또는 Instagram Reels URL을 입력해주세요.',
            };
        }

        try {
            switch (platform) {
                case 'youtube':
                    return await this.youtubeDownloader.download(url, options);
                case 'instagram':
                    return await this.instagramDownloader.download(url, options);
                default:
                    return {
                        success: false,
                        error: `지원하지 않는 플랫폼: ${platform}`,
                    };
            }
        } catch (error) {
            return {
                success: false,
                error: `다운로드 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}

// 기본 내보내기
export default VideoDownloader;
