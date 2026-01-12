/**
 * 지원하는 플랫폼 타입
 */
export type Platform = 'youtube' | 'instagram' | null;

/**
 * URL 검증 결과
 */
export interface URLValidationResult {
    isValid: boolean;
    platform: Platform;
    videoId?: string;
    error?: string;
}

/**
 * YouTube Shorts URL 패턴
 * 지원 형식:
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/shorts/VIDEO_ID
 * - https://youtu.be/VIDEO_ID (일반 동영상이지만 Shorts일 수 있음)
 */
const YOUTUBE_SHORTS_PATTERNS = [
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
    /^https?:\/\/(?:m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
];

/**
 * Instagram Reels URL 패턴
 * 지원 형식:
 * - https://www.instagram.com/reel/REEL_ID/
 * - https://instagram.com/reel/REEL_ID/
 * - https://www.instagram.com/p/POST_ID/ (일반 포스트이지만 Reels일 수 있음)
 */
const INSTAGRAM_REELS_PATTERNS = [
    /^https?:\/\/(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)\/?(?:\?.*)?$/,
    /^https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)\/?(?:\?.*)?$/,
];

/**
 * URL에서 플랫폼을 감지합니다
 * @param url - 검증할 URL
 * @returns 감지된 플랫폼 ('youtube', 'instagram', null)
 */
export function detectPlatform(url: string): Platform {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const trimmedUrl = url.trim();

    // YouTube 패턴 확인
    for (const pattern of YOUTUBE_SHORTS_PATTERNS) {
        if (pattern.test(trimmedUrl)) {
            return 'youtube';
        }
    }

    // Instagram 패턴 확인
    for (const pattern of INSTAGRAM_REELS_PATTERNS) {
        if (pattern.test(trimmedUrl)) {
            return 'instagram';
        }
    }

    return null;
}

/**
 * YouTube URL에서 비디오 ID를 추출합니다
 * @param url - YouTube URL
 * @returns 비디오 ID 또는 null
 */
export function extractYouTubeVideoId(url: string): string | null {
    for (const pattern of YOUTUBE_SHORTS_PATTERNS) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

/**
 * Instagram URL에서 Reel ID를 추출합니다
 * @param url - Instagram URL
 * @returns Reel ID 또는 null
 */
export function extractInstagramReelId(url: string): string | null {
    for (const pattern of INSTAGRAM_REELS_PATTERNS) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

/**
 * URL의 유효성을 검증하고 플랫폼 정보를 반환합니다
 * @param url - 검증할 URL
 * @returns URL 검증 결과
 */
export function validateURL(url: string): URLValidationResult {
    // 빈 URL 체크
    if (!url || typeof url !== 'string') {
        return {
            isValid: false,
            platform: null,
            error: 'URL을 입력해주세요.',
        };
    }

    const trimmedUrl = url.trim();

    // URL 형식 체크
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return {
            isValid: false,
            platform: null,
            error: 'URL은 http:// 또는 https://로 시작해야 합니다.',
        };
    }

    // 플랫폼 감지
    const platform = detectPlatform(trimmedUrl);

    if (!platform) {
        return {
            isValid: false,
            platform: null,
            error: '지원하지 않는 URL 형식입니다. YouTube Shorts 또는 Instagram Reels URL을 입력해주세요.',
        };
    }

    // 비디오 ID 추출
    let videoId: string | null = null;
    if (platform === 'youtube') {
        videoId = extractYouTubeVideoId(trimmedUrl);
    } else if (platform === 'instagram') {
        videoId = extractInstagramReelId(trimmedUrl);
    }

    if (!videoId) {
        return {
            isValid: false,
            platform,
            error: `${platform === 'youtube' ? 'YouTube' : 'Instagram'} 비디오 ID를 추출할 수 없습니다.`,
        };
    }

    return {
        isValid: true,
        platform,
        videoId,
    };
}

/**
 * URL을 정규화합니다 (불필요한 쿼리 파라미터 제거 등)
 * @param url - 정규화할 URL
 * @returns 정규화된 URL
 */
export function normalizeURL(url: string): string {
    const trimmedUrl = url.trim();
    const platform = detectPlatform(trimmedUrl);

    if (!platform) {
        return trimmedUrl;
    }

    if (platform === 'youtube') {
        const videoId = extractYouTubeVideoId(trimmedUrl);
        if (videoId) {
            return `https://www.youtube.com/shorts/${videoId}`;
        }
    } else if (platform === 'instagram') {
        const reelId = extractInstagramReelId(trimmedUrl);
        if (reelId) {
            return `https://www.instagram.com/reel/${reelId}/`;
        }
    }

    return trimmedUrl;
}
