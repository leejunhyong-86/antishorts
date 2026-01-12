'use client';

import { useEffect, useState } from 'react';
import type { Video } from '@/lib/supabase/client';
import VideoCard from './VideoCard';

interface VideoGridProps {
    onVideoDelete?: () => void;
}

export default function VideoGrid({ onVideoDelete }: VideoGridProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState<'all' | 'youtube' | 'instagram'>('all');

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (platformFilter !== 'all') {
                params.append('platform', platformFilter);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`/api/videos?${params.toString()}`);
            const data = await response.json();
            setVideos(data.videos || []);
        } catch (error) {
            console.error('비디오 로딩 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [platformFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVideos();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 비디오를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`/api/videos/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setVideos(videos.filter(v => v.id !== id));
                onVideoDelete?.();
            }
        } catch (error) {
            console.error('비디오 삭제 오류:', error);
            alert('비디오 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="w-full">
            {/* 검색 및 필터 */}
            <div className="mb-8 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="비디오 검색..."
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                        검색
                    </button>
                </form>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPlatformFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${platformFilter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setPlatformFilter('youtube')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${platformFilter === 'youtube'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        YouTube
                    </button>
                    <button
                        onClick={() => setPlatformFilter('instagram')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${platformFilter === 'instagram'
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Instagram
                    </button>
                </div>
            </div>

            {/* 비디오 그리드 */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">비디오가 없습니다.</p>
                    <p className="text-sm mt-2">위에서 URL을 입력하여 비디오를 다운로드하세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onDelete={() => handleDelete(video.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
