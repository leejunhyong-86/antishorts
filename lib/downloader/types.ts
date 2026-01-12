/**
 * 다운로드 진행률 정보
 */
export interface DownloadProgress {
    percent: number; // 0-100
    downloadedBytes: number;
    totalBytes: number;
    speed: number; // bytes per second
    eta: number; // seconds
}

/**
 * 다운로드 결과
 */
export interface DownloadResult {
    success: boolean;
    filePath?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number; // seconds
    error?: string;
}

/**
 * 비디오 메타데이터
 */
export interface VideoMetadata {
    title: string;
    description?: string;
    uploader?: string;
    uploadDate?: string;
    duration?: number; // seconds
    thumbnailUrl?: string;
    videoId: string;
    platform: 'youtube' | 'instagram';
}

/**
 * 다운로드 옵션
 */
export interface DownloadOptions {
    outputDir?: string;
    format?: 'mp4' | 'webm' | 'best';
    quality?: 'best' | 'high' | 'medium' | 'low';
    maxRetries?: number;
    onProgress?: (progress: DownloadProgress) => void;
}
