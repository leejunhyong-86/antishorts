import { NextRequest, NextResponse } from 'next/server';
import { videoDb } from '@/lib/supabase/database';
import path from 'path';
import { deleteFile } from '@/lib/downloader/file-utils';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: NextRequest,
    context: RouteParams
) {
    try {
        const { id } = await context.params;
        const video = await videoDb.getVideoById(id);

        if (!video) {
            return NextResponse.json(
                { error: '비디오를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ video });
    } catch (error) {
        console.error('비디오 조회 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: RouteParams
) {
    try {
        const { id } = await context.params;

        // 비디오 정보 조회
        const video = await videoDb.getVideoById(id);

        if (!video) {
            return NextResponse.json(
                { error: '비디오를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 로컬 파일 삭제
        if (video.file_url) {
            const fileName = video.file_url.replace('/videos/', '');
            const localPath = path.join(process.cwd(), 'downloads', fileName);
            const deleted = await deleteFile(localPath);
            if (deleted) {
                console.log('로컬 파일 삭제 완료:', localPath);
            } else {
                console.log('로컬 파일 삭제 실패 (무시):', localPath);
            }
        }

        // 데이터베이스에서 삭제
        const success = await videoDb.deleteVideo(id);

        if (!success) {
            return NextResponse.json(
                { error: '비디오 삭제 실패' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('비디오 삭제 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
