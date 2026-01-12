'use client';

import { useState } from 'react';
import DownloadForm from '@/components/DownloadForm';
import VideoGrid from '@/components/VideoGrid';

export default function Home() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDownloadComplete = () => {
        // 비디오 그리드 새로고침
        setRefreshKey(prev => prev + 1);
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        AntiShorts
                    </h1>
                    <p className="text-gray-400 text-lg">
                        YouTube Shorts와 Instagram Reels를 다운로드하고 관리하세요
                    </p>
                </header>

                {/* 다운로드 폼 */}
                <section className="mb-16">
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                        <h2 className="text-2xl font-bold mb-6 text-white">비디오 다운로드</h2>
                        <DownloadForm
                            onDownloadComplete={handleDownloadComplete}
                            onDownloadError={(error) => console.error(error)}
                        />
                    </div>
                </section>

                {/* 비디오 라이브러리 */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">내 라이브러리</h2>
                        <p className="text-gray-400 mt-2">다운로드한 비디오를 관리하세요</p>
                    </div>
                    <VideoGrid key={refreshKey} onVideoDelete={handleDownloadComplete} />
                </section>

                {/* 푸터 */}
                <footer className="mt-16 text-center text-gray-500 text-sm">
                    <p>개인 사용 목적으로만 제작되었습니다.</p>
                    <p className="mt-2">다운로드한 콘텐츠의 저작권은 원 제작자에게 있습니다.</p>
                </footer>
            </div>
        </main>
    );
}
