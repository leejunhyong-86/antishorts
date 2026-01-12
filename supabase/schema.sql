-- Supabase 데이터베이스 스키마
-- AntiShorts 비디오 관리 시스템

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- videos 테이블 생성
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram')),
  
  -- URL 정보
  original_url TEXT NOT NULL UNIQUE,
  video_id TEXT NOT NULL,
  
  -- 파일 정보
  file_url TEXT, -- Supabase Storage URL
  file_path TEXT, -- 로컬 파일 경로 (서버용)
  file_name TEXT,
  file_size BIGINT, -- bytes
  
  -- 썸네일
  thumbnail_url TEXT,
  thumbnail_path TEXT,
  
  -- 비디오 메타데이터
  duration INTEGER, -- 초 단위
  uploader TEXT,
  upload_date TIMESTAMP,
  
  -- 다운로드 정보
  download_date TIMESTAMP DEFAULT NOW(),
  download_quality TEXT, -- 'best', 'high', 'medium', 'low'
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);
CREATE INDEX IF NOT EXISTS idx_videos_download_date ON videos(download_date DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_title ON videos USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);

-- 전체 텍스트 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_videos_search ON videos 
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(uploader, '')));

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 (선택사항)
-- ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
-- CREATE POLICY "Videos are viewable by everyone" 
--   ON videos FOR SELECT 
--   USING (true);

-- 인증된 사용자만 삽입/업데이트/삭제 가능
-- CREATE POLICY "Authenticated users can insert videos" 
--   ON videos FOR INSERT 
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can update videos" 
--   ON videos FOR UPDATE 
--   USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can delete videos" 
--   ON videos FOR DELETE 
--   USING (auth.role() = 'authenticated');
