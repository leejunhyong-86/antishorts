-- 잘못 저장된 비디오 정리
-- file_url이 null인 비디오들을 삭제합니다
-- (Storage 업로드는 실패했지만 DB에는 저장된 경우)

-- 1. 삭제될 비디오 확인 (먼저 확인하세요!)
SELECT id, title, file_url, created_at 
FROM videos 
WHERE file_url IS NULL;

-- 2. file_url이 null인 비디오 삭제 (확인 후 실행)
-- DELETE FROM videos WHERE file_url IS NULL;

-- 3. 모든 비디오 개수 확인
SELECT 
    COUNT(*) as total_videos,
    COUNT(file_url) as videos_with_file,
    COUNT(*) - COUNT(file_url) as videos_without_file
FROM videos;
