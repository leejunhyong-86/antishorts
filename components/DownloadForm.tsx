'use client';

import { useState } from 'react';
import { validateURL } from '@/lib/url-validator';

interface DownloadFormProps {
    onDownloadStart?: () => void;
    onDownloadComplete?: () => void;
    onDownloadError?: (error: string) => void;
}

export default function DownloadForm({
    onDownloadStart,
    onDownloadComplete,
    onDownloadError,
}: DownloadFormProps) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // URL 검증
        const validation = validateURL(url);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid URL');
            return;
        }

        setIsLoading(true);
        onDownloadStart?.();

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '다운로드 실패');
            }

            setSuccess('다운로드 완료!');
            setUrl('');
            onDownloadComplete?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '다운로드 중 오류가 발생했습니다.';
            setError(errorMessage);
            onDownloadError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const platformInfo = url ? validateURL(url) : null;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="url" className="block text-sm font-medium mb-2">
                        비디오 URL
                    </label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="YouTube Shorts 또는 Instagram Reels URL을 입력하세요"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                        disabled={isLoading}
                    />
                    {platformInfo && platformInfo.isValid && (
                        <p className="mt-2 text-sm text-green-400">
                            ✓ {platformInfo.platform === 'youtube' ? 'YouTube Shorts' : 'Instagram Reels'} 감지됨
                        </p>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !url}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            다운로드 중...
                        </span>
                    ) : (
                        '다운로드'
                    )}
                </button>
            </form>
        </div>
    );
}
