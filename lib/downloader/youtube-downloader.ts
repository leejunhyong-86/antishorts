import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import {
    DownloadResult,
    DownloadOptions,
    VideoMetadata,
    DownloadProgress
} from './types';
import {
    generateUniqueFileName,
    ensureDir,
    getFileSize,
    sanitizeFileName
} from './file-utils';

/**
 * YouTube 다운로더 클래스
 */
export class YouTubeDownloader {
    private ytDlp: YTDlpWrap;
    private defaultOutputDir: string;

    constructor(outputDir: string = './downloads') {
        this.ytDlp = new YTDlpWrap();
        this.defaultOutputDir = outputDir;
    }

    /**
     * 비디오 메타데이터 추출
     */
    async getMetadata(url: string): Promise<VideoMetadata> {
        try {
            const info = await this.ytDlp.getVideoInfo(url);

            return {
                title: info.title || 'Untitled',
                description: info.description,
                uploader: info.uploader || info.channel,
                uploadDate: info.upload_date,
                duration: info.duration,
                thumbnailUrl: info.thumbnail,
                videoId: info.id,
                platform: 'youtube',
            };
        } catch (error) {
            throw new Error(`메타데이터 추출 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * YouTube Shorts 다운로드
     */
    async download(
        url: string,
        options: DownloadOptions = {}
    ): Promise<DownloadResult> {
        const {
            outputDir = this.defaultOutputDir,
            format = 'mp4',
            quality = 'best',
            maxRetries = 3,
            onProgress,
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
                const outputPath = path.join(outputDir, fileName);

                // yt-dlp 옵션 설정
                const ytDlpArgs = [
                    '--format', this.getFormatString(quality),
                    '--merge-output-format', format,
                    '--output', outputPath,
                    '--no-playlist',
                    '--no-warnings',
                    url,
                ];

                // 진행률 추적
                let lastProgress = 0;
                const progressRegex = /(\d+\.?\d*)%/;

                await this.ytDlp.execPromise(ytDlpArgs);

                // 다운로드 완료 후 파일 크기 확인
                const fileSize = await getFileSize(outputPath);

                return {
                    success: true,
                    filePath: outputPath,
                    fileName,
                    fileSize,
                    duration: metadata.duration,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                attempt++;

                if (attempt < maxRetries) {
                    // 재시도 전 대기 (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                }
            }
        }

        return {
            success: false,
            error: `다운로드 실패 (${maxRetries}번 시도): ${lastError?.message || '알 수 없는 오류'}`,
        };
    }

    /**
     * 품질에 따른 포맷 문자열 생성
     */
    private getFormatString(quality: string): string {
        switch (quality) {
            case 'best':
                return 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
            case 'high':
                return 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best';
            case 'medium':
                return 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best';
            case 'low':
                return 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best';
            default:
                return 'best[ext=mp4]/best';
        }
    }
}
