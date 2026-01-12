'use client';

import { useState } from 'react';
import type { Video } from '@/lib/supabase/client';
import { formatBytes, formatDuration } from '@/lib/utils/format';

interface VideoCardProps {
    video: Video;
    onDelete: () => void;
}

export default function VideoCard({ video, onDelete }: VideoCardProps) {
    const [showPlayer, setShowPlayer] = useState(false);

    const platformColor = video.platform === 'youtube' ? 'bg-red-600' : 'bg-pink-600';
    const platformName = video.platform === 'youtube' ? 'YouTube' : 'Instagram';

    return (
        <>
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                {/* 썸네일 */}
                <div
                    className="relative aspect-video bg-gray-800 cursor-pointer group"
                    onClick={() => setShowPlayer(true)}
                >
                    {video.thumbnail_url ? (
                        <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}

                    {/* 재생 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* 플랫폼 배지 */}
                    <div className={`absolute top-2 left-2 ${platformColor} px-2 py-1 rounded text-xs font-medium`}>
                        {platformName}
                    </div>

                    {/* 길이 */}
                    {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
                            {formatDuration(video.duration)}
                        </div>
                    )}
                </div>

                {/* 정보 */}
                <div className="p-4">
                    <h3 className="font-medium text-white line-clamp-2 mb-2">
                        {video.title}
                    </h3>

                    {video.uploader && (
                        <p className="text-sm text-gray-400 mb-2">{video.uploader}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(video.download_date).toLocaleDateString('ko-KR')}</span>
                        {video.file_size && <span>{formatBytes(video.file_size)}</span>}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => setShowPlayer(true)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                        >
                            재생
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>

            {/* 비디오 플레이어 모달 */}
            {showPlayer && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowPlayer(false)}
                >
                    <div
                        className="relative max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowPlayer(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
                        >
                            ✕
                        </button>

                        {video.file_url ? (
                            <video
                                src={video.file_url}
                                controls
                                autoPlay
                                className="w-full rounded-lg"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="bg-gray-900 rounded-lg p-8 text-center">
                                <p className="text-gray-400">비디오 파일을 찾을 수 없습니다.</p>
                            </div>
                        )}

                        <div className="mt-4 bg-gray-900 rounded-lg p-4">
                            <h2 className="text-xl font-bold text-white mb-2">{video.title}</h2>
                            {video.description && (
                                <p className="text-gray-400 text-sm mb-4">{video.description}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">업로더:</span>
                                    <span className="text-white ml-2">{video.uploader || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">플랫폼:</span>
                                    <span className="text-white ml-2">{platformName}</span>
                                </div>
                                {video.duration && (
                                    <div>
                                        <span className="text-gray-500">길이:</span>
                                        <span className="text-white ml-2">{formatDuration(video.duration)}</span>
                                    </div>
                                )}
                                {video.file_size && (
                                    <div>
                                        <span className="text-gray-500">크기:</span>
                                        <span className="text-white ml-2">{formatBytes(video.file_size)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
