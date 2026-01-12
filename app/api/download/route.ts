import { NextRequest, NextResponse } from 'next/server';
import VideoDownloader from '@/lib/downloader';
import { videoDb } from '@/lib/supabase/database';
import { storage } from '@/lib/supabase/storage';
import { validateURL } from '@/lib/url-validator';
import type { VideoInsert } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        // URL 검증
        const validation = validateURL(url);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // 이미 다운로드된 비디오인지 확인
        const exists = await videoDb.videoExists(url);
        if (exists) {
            return NextResponse.json(
                { error: '이미 다운로드된 비디오입니다.' },
                { status: 409 }
            );
        }

        // 다운로더 초기화
        const downloader = new VideoDownloader('./downloads');

        // 메타데이터 추출
        const metadata = await downloader.getMetadata(url);

        // 비디오 다운로드
        const downloadResult = await downloader.download(url, {
            quality: 'best',
            format: 'mp4',
            maxRetries: 3,
        });

        if (!downloadResult.success) {
            return NextResponse.json(
                { error: downloadResult.error || '다운로드 실패' },
                { status: 500 }
            );
        }

        // Supabase Storage에 업로드
        let fileUrl: string | null = null;
        let thumbnailUrl: string | null = null;

        if (downloadResult.filePath) {
            const storagePath = storage.generateStoragePath(
                validation.platform!,
                downloadResult.fileName!,
                'video'
            );

            fileUrl = await storage.uploadFile(downloadResult.filePath, storagePath);
        }

        // 데이터베이스에 저장
        const videoData: VideoInsert = {
            title: metadata.title,
            description: metadata.description,
            platform: metadata.platform,
            original_url: url,
            video_id: metadata.videoId,
            file_url: fileUrl || undefined,
            file_path: downloadResult.filePath,
            file_name: downloadResult.fileName,
            file_size: downloadResult.fileSize,
            thumbnail_url: metadata.thumbnailUrl,
            duration: metadata.duration,
            uploader: metadata.uploader,
            upload_date: metadata.uploadDate,
            download_quality: 'best',
        };

        const savedVideo = await videoDb.addVideo(videoData);

        if (!savedVideo) {
            return NextResponse.json(
                { error: '데이터베이스 저장 실패' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            video: savedVideo,
        });
    } catch (error) {
        console.error('다운로드 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
