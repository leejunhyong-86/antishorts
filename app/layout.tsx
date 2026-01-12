import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AntiShorts - 숏폼 비디오 다운로더",
    description: "YouTube Shorts와 Instagram Reels를 다운로드하고 관리하세요",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
