import { NextRequest, NextResponse } from 'next/server';
import { videoDb } from '@/lib/supabase/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform') as 'youtube' | 'instagram' | null;
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let videos;

        if (search) {
            videos = await videoDb.searchVideos(search, { limit, offset });
        } else if (platform) {
            videos = await videoDb.getVideosByPlatform(platform, { limit, offset });
        } else {
            videos = await videoDb.getAllVideos({ limit, offset });
        }

        return NextResponse.json({ videos });
    } catch (error) {
        console.error('비디오 조회 API 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
