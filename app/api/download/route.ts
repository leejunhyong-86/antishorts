import { NextRequest, NextResponse } from 'next/server';
import VideoDownloader from '@/lib/downloader';
import { videoDb } from '@/lib/supabase/database';
import { storage } from '@/lib/supabase/storage';
import { validateURL } from '@/lib/url-validator';
import type { VideoInsert } from '@/lib/supabase/client';
import { deleteFile } from '@/lib/downloader/file-utils';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        console.log('다운로드 요청:', url);

        // URL 검증
        const validation = validateURL(url);
        if (!validation.isValid) {
            console.log('URL 검증 실패:', validation.error);
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        console.log('URL 검증 성공:', validation.platform);

        // 이미 다운로드된 비디오인지 확인
        const exists = await videoDb.videoExists(url);
        if (exists) {
            console.log('이미 존재하는 비디오');
            return NextResponse.json(
                { error: '이미 다운로드된 비디오입니다.' },
                { status: 409 }
            );
        }

        console.log('다운로더 초기화 중...');

        // 다운로더 초기화
        const downloader = new VideoDownloader('./downloads');

        console.log('메타데이터 추출 중...');

        // 메타데이터 추출
        const metadata = await downloader.getMetadata(url);
        console.log('메타데이터:', metadata);

        console.log('비디오 다운로드 시작...');

        // 비디오 다운로드
        const downloadResult = await downloader.download(url, {
            quality: 'best',
            format: 'mp4',
            maxRetries: 3,
        });

        console.log('다운로드 결과:', downloadResult);

        if (!downloadResult.success) {
            console.error('다운로드 실패:', downloadResult.error);
            return NextResponse.json(
                { error: downloadResult.error || '다운로드 실패' },
                { status: 500 }
            );
        }

        console.log('Storage 업로드 시작...');

        // Supabase Storage에 업로드
        let fileUrl: string | null = null;
        let thumbnailUrl: string | null = null;

        try {
            if (downloadResult.filePath) {
                const storagePath = storage.generateStoragePath(
                    validation.platform!,
                    downloadResult.fileName!,
                    'video'
                );

                console.log('Storage 경로:', storagePath);

                fileUrl = await storage.uploadFile(downloadResult.filePath, storagePath);
                console.log('업로드된 파일 URL:', fileUrl);

                // Storage 업로드 완료 후 로컬 임시 파일 삭제
                await deleteFile(downloadResult.filePath);
                console.log('로컬 임시 파일 삭제 완료:', downloadResult.filePath);
            }
        } catch (uploadError) {
            console.error('Storage 업로드 또는 파일 삭제 오류:', uploadError);
            // 업로드 실패 시에도 로컬 파일 정리 시도
            if (downloadResult.filePath) {
                await deleteFile(downloadResult.filePath).catch(() => {});
            }
            return NextResponse.json(
                { error: 'Storage 업로드 실패' },
                { status: 500 }
            );
        }

        console.log('데이터베이스 저장 중...');

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
            console.error('데이터베이스 저장 실패');
            
            // 데이터베이스 저장 실패 시 업로드된 파일 롤백
            if (fileUrl) {
                const filePath = storage.extractPathFromUrl(fileUrl);
                if (filePath) {
                    await storage.deleteFile(filePath).catch(() => {});
                    console.log('업로드된 파일 롤백 완료');
                }
            }
            
            return NextResponse.json(
                { error: '데이터베이스 저장 실패' },
                { status: 500 }
            );
        }

        console.log('다운로드 완료:', savedVideo.id);

        return NextResponse.json({
            success: true,
            video: savedVideo,
        });
    } catch (error) {
        console.error('다운로드 API 오류:', error);
        console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
        
        // 예외 발생 시 다운로드된 파일 정리 시도
        try {
            const response = await fetch(`${request.url}?cleanup=true`);
        } catch {}
        
        return NextResponse.json(
            {
                error: '서버 오류가 발생했습니다.',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
