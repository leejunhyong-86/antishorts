import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
    DownloadResult,
    DownloadOptions,
    VideoMetadata,
} from './types';
import {
    generateUniqueFileName,
    ensureDir,
    getFileSize,
} from './file-utils';

const execAsync = promisify(exec);

/**
 * YouTube 다운로더 클래스 (Python yt-dlp 사용)
 */
export class YouTubeDownloader {
    private defaultOutputDir: string;

    constructor(outputDir: string = './downloads') {
        this.defaultOutputDir = outputDir;
    }

    /**
     * 비디오 메타데이터 추출
     */
    async getMetadata(url: string): Promise<VideoMetadata> {
        try {
            const command = `python -m yt_dlp --dump-json --no-warnings "${url}"`;
            const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
            const info = JSON.parse(stdout);

            return {
                title: info.title || 'Untitled',
                description: info.description,
                uploader: info.uploader || info.channel,
                uploadDate: info.upload_date,
                duration: info.duration ? Math.floor(info.duration) : undefined,
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

                // 절대 경로로 변환
                const absoluteOutputDir = path.resolve(outputDir);
                const outputPath = path.join(absoluteOutputDir, fileName);

                // 파일명에서 확장자 제거 (yt-dlp가 자동으로 추가)
                const outputTemplate = outputPath.replace(/\.mp4$/, '');

                // yt-dlp 명령어 실행
                const formatString = this.getFormatString(quality);
                const command = `python -m yt_dlp --format "${formatString}" --merge-output-format ${format} -o "${outputTemplate}.%(ext)s" --no-playlist --no-warnings "${url}"`;

                console.log('YouTube 다운로드 시작:', url);
                const { stdout, stderr } = await execAsync(command, { maxBuffer: 50 * 1024 * 1024 });
                
                if (stdout) console.log('yt-dlp 출력:', stdout);
                if (stderr) console.log('yt-dlp 경고:', stderr);
                
                console.log('다운로드 완료:', outputPath);

                // 다운로드 완료 후 파일 크기 확인
                const fileSize = await getFileSize(outputPath);
                console.log('파일 크기:', fileSize, '경로:', outputPath);

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
     * ffmpeg 없이도 작동하도록 이미 병합된 포맷 우선
     */
    private getFormatString(quality: string): string {
        switch (quality) {
            case 'best':
                // 이미 병합된 포맷 우선, 없으면 별도 다운로드 후 병합
                return 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';
            case 'high':
                return 'best[height<=1080][ext=mp4]/bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]';
            case 'medium':
                return 'best[height<=720][ext=mp4]/bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]';
            case 'low':
                return 'best[height<=480][ext=mp4]/bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]';
            default:
                return 'best[ext=mp4]/best';
        }
    }
}
