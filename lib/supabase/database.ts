import { supabase } from './client';
import { supabaseAdmin } from './server';
import type { Video, VideoInsert, VideoUpdate } from './client';

/**
 * 비디오 데이터베이스 작업 클래스
 */
export class VideoDatabase {
    /**
     * 새 비디오 추가
     */
    async addVideo(video: VideoInsert): Promise<Video | null> {
        try {
            const { data, error } = await supabase
                .from('videos')
                .insert(video)
                .select()
                .single();

            if (error) {
                console.error('비디오 추가 오류:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('비디오 추가 예외:', error);
            return null;
        }
    }

    /**
     * 모든 비디오 조회
     */
    async getAllVideos(options?: {
        limit?: number;
        offset?: number;
        orderBy?: 'created_at' | 'download_date' | 'title';
        order?: 'asc' | 'desc';
    }): Promise<Video[]> {
        try {
            const {
                limit = 50,
                offset = 0,
                orderBy = 'created_at',
                order = 'desc',
            } = options || {};

            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order(orderBy, { ascending: order === 'asc' })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('비디오 조회 오류:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('비디오 조회 예외:', error);
            return [];
        }
    }

    /**
     * ID로 비디오 조회
     */
    async getVideoById(id: string): Promise<Video | null> {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('비디오 조회 오류:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('비디오 조회 예외:', error);
            return null;
        }
    }

    /**
     * 플랫폼별 비디오 조회
     */
    async getVideosByPlatform(
        platform: 'youtube' | 'instagram',
        options?: {
            limit?: number;
            offset?: number;
        }
    ): Promise<Video[]> {
        try {
            const { limit = 50, offset = 0 } = options || {};

            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('platform', platform)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('플랫폼별 비디오 조회 오류:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('플랫폼별 비디오 조회 예외:', error);
            return [];
        }
    }

    /**
     * 비디오 검색 (제목, 설명, 업로더)
     */
    async searchVideos(query: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<Video[]> {
        try {
            const { limit = 50, offset = 0 } = options || {};

            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,uploader.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('비디오 검색 오류:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('비디오 검색 예외:', error);
            return [];
        }
    }

    /**
     * 비디오 업데이트
     */
    async updateVideo(id: string, updates: VideoUpdate): Promise<Video | null> {
        try {
            const { data, error } = await supabase
                .from('videos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('비디오 업데이트 오류:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('비디오 업데이트 예외:', error);
            return null;
        }
    }

    /**
     * 비디오 삭제
     */
    async deleteVideo(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('비디오 삭제 오류:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('비디오 삭제 예외:', error);
            return false;
        }
    }

    /**
     * URL로 비디오 존재 여부 확인
     */
    async videoExists(url: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('id')
                .eq('original_url', url)
                .single();

            return !error && data !== null;
        } catch {
            return false;
        }
    }

    /**
     * 비디오 개수 조회
     */
    async getVideoCount(platform?: 'youtube' | 'instagram'): Promise<number> {
        try {
            let query = supabase
                .from('videos')
                .select('*', { count: 'exact', head: true });

            if (platform) {
                query = query.eq('platform', platform);
            }

            const { count, error } = await query;

            if (error) {
                console.error('비디오 개수 조회 오류:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('비디오 개수 조회 예외:', error);
            return 0;
        }
    }
}

// 싱글톤 인스턴스
export const videoDb = new VideoDatabase();
