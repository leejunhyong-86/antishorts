import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (클라이언트 사이드)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 프로덕션 환경에서만 에러 발생
if (process.env.NODE_ENV === 'production' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Supabase URL과 Anon Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
export interface Video {
    id: string;
    title: string;
    description?: string;
    platform: 'youtube' | 'instagram';
    original_url: string;
    video_id: string;
    file_url?: string;
    file_path?: string;
    file_name?: string;
    file_size?: number;
    thumbnail_url?: string;
    thumbnail_path?: string;
    duration?: number;
    uploader?: string;
    upload_date?: string;
    download_date: string;
    download_quality?: string;
    created_at: string;
    updated_at: string;
}

export type VideoInsert = Omit<Video, 'id' | 'created_at' | 'updated_at' | 'download_date'>;
export type VideoUpdate = Partial<VideoInsert>;
