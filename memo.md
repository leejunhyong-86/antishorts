# AntiShorts 개발 작업 메모

## 프로젝트 개요
- **프로젝트명**: AntiShorts
- **목적**: YouTube Shorts 및 Instagram Reels 다운로드 및 관리
- **기술 스택**: Next.js 15, TypeScript, TailwindCSS, Supabase (PostgreSQL + Storage), yt-dlp
- **배포**: 자체 호스팅 (Self-hosted)

---

## 완료된 작업

### 1. 프로젝트 설정 ✅
- Next.js 15 프로젝트 초기화
- TypeScript, TailwindCSS 설정
- 환경 변수 설정 (`.env.local`)
- Git 저장소 설정 및 GitHub 연동

### 2. URL 검증 및 플랫폼 감지 ✅
**파일**: `lib/url-validator.ts`

**기능**:
- YouTube Shorts URL 패턴 인식
- Instagram Reels URL 패턴 인식 (`/reel/`, `/reels/` 모두 지원)
- 비디오 ID 추출
- URL 정규화

**테스트**: `lib/__tests__/url-validator.test.ts` (18개 테스트 통과)

### 3. 비디오 다운로드 기능 ✅
**파일**:
- `lib/downloader/youtube-downloader.ts`
- `lib/downloader/instagram-downloader.ts`
- `lib/downloader/index.ts`
- `lib/downloader/types.ts`
- `lib/downloader/file-utils.ts`

**구현 내용**:
- `python -m yt_dlp`를 사용한 비디오 다운로드
- 메타데이터 추출 (제목, 업로더, 길이, 썸네일 등)
- 재시도 로직 (exponential backoff, 최대 3회)
- 품질 옵션 (best, high, medium, low)
- MP4 포맷 보장
- 이미 병합된 포맷 우선 다운로드 (ffmpeg 불필요)
- Duration float → integer 변환 (PostgreSQL 호환성)

**테스트**: `lib/downloader/__tests__/` (37개 테스트 통과)

### 4. Supabase 데이터베이스 ✅
**파일**: `supabase/schema.sql`

**스키마**:
- `videos` 테이블 (20개 컬럼)
  - 기본 정보: title, description, platform
  - URL 정보: original_url, video_id
  - 파일 정보: file_url, file_path, file_name, file_size
  - 썸네일: thumbnail_url, thumbnail_path
  - 메타데이터: duration (INTEGER), uploader, upload_date
  - 다운로드 정보: download_date, download_quality
  - 타임스탬프: created_at, updated_at

**인덱스**:
- platform, download_date, created_at
- 전체 텍스트 검색 (title, description, uploader)

**트리거**: `updated_at` 자동 업데이트

**구현**: `lib/supabase/database.ts` (VideoDatabase 클래스)
- CRUD 작업 (addVideo, getVideoById, getAllVideos, updateVideo, deleteVideo)
- 검색 및 필터링 (searchVideos, getVideosByPlatform)
- 페이지네이션 지원
- videoExists, getVideoCount

### 5. Supabase Storage ✅
**파일**: `lib/supabase/storage.ts`

**구현**: StorageManager 클래스
- 파일 업로드 (uploadFile, uploadThumbnail)
- 파일 삭제 (deleteFile)
- 저장 경로 생성 (generateStoragePath)
  - 형식: `{platform}/{year}/{month}/{day}/{type}/{filename}`
  - 예: `youtube/2026/01/12/video/video_name.mp4`
- URL 파싱 (extractPathFromUrl)

### 6. API Routes ✅
**파일**:
- `app/api/download/route.ts` - 다운로드 요청 처리
- `app/api/videos/route.ts` - 비디오 목록 조회
- `app/api/videos/[id]/route.ts` - 개별 비디오 조회/삭제

**기능**:
- URL 검증
- 중복 다운로드 체크
- 메타데이터 추출
- 비디오 다운로드
- Supabase Storage 업로드
- 데이터베이스 저장
- 상세한 로깅

### 7. UI 컴포넌트 ✅
**파일**:
- `components/DownloadForm.tsx` - URL 입력 및 다운로드
- `components/VideoGrid.tsx` - 비디오 목록 그리드
- `components/VideoCard.tsx` - 비디오 카드 및 플레이어 모달
- `app/page.tsx` - 메인 페이지

**기능**:
- 실시간 URL 검증
- 플랫폼 감지 표시
- 다운로드 진행 상태
- 검색 및 플랫폼 필터링
- 비디오 재생 모달
- 비디오 삭제
- 반응형 디자인

### 8. 유틸리티 ✅
**파일**: `lib/utils/format.ts`

**기능**:
- `formatBytes()` - 바이트를 읽기 쉬운 형식으로 변환
- `formatDuration()` - 초를 시:분:초 형식으로 변환

---

## 설치 및 설정

### 필수 요구사항
1. **Node.js 18+**
2. **Python 3.8+**
3. **yt-dlp**: `python -m pip install yt-dlp`
4. **Supabase 계정**

### 환경 변수 (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase 설정
1. **데이터베이스**: `supabase/schema.sql` 실행
2. **Storage**: `videos` 버킷 생성 (Public)

---

## 테스트 결과
- **총 테스트**: 63개
- **통과**: 63개 ✅
- **실패**: 0개

**테스트 스위트**:
- URL Validator: 18개
- File Utils: 14개
- Downloader: 5개
- Database: 13개
- Storage: 13개

---

## 알려진 이슈 및 해결

### 1. yt-dlp PATH 문제 ✅ 해결
**문제**: `spawn yt-dlp ENOENT`
**해결**: `python -m yt_dlp` 직접 사용

### 2. ffmpeg 없이 병합 문제 ✅ 해결
**문제**: 비디오와 오디오가 따로 다운로드됨
**해결**: 이미 병합된 포맷 우선 다운로드 (`best[ext=mp4]/best`)

### 3. Duration 타입 오류 ✅ 해결
**문제**: `invalid input syntax for type integer: "15.933"`
**해결**: `Math.floor(duration)` 적용

### 4. Instagram URL 패턴 ✅ 해결
**문제**: `/reels/` (복수) 인식 안 됨
**해결**: 정규식 `/reels?/`로 수정

### 5. Supabase Storage 버킷 ⏳ 진행 중
**문제**: `Bucket not found`
**해결**: Supabase 대시보드에서 `videos` 버킷 생성 필요

---

## Git 커밋 히스토리

1. `73e9e38` - UI 및 API 통합 구현
2. `a761643` - 다운로드 및 데이터베이스 이슈 해결
3. `692d6bf` - Instagram Reels 다운로드 구현
4. `4c11d18` - Instagram `/reels/` URL 패턴 지원
5. `2d47d4f` - Duration integer 변환 (현재)

---

## 다음 단계

### 즉시 필요
- [ ] Supabase Storage `videos` 버킷 생성

### 선택 사항
- [ ] ffmpeg 설치 (고품질 다운로드)
- [ ] 다운로드 진행률 실시간 표시
- [ ] 에러 처리 개선
- [ ] 로딩 스피너 추가
- [ ] 다운로드 대기열 구현

---

## 참고 사항

### Instagram 다운로드
- Instagram은 정책 변경으로 다운로드가 제한될 수 있음
- 비공개 계정 또는 제한된 콘텐츠는 다운로드 불가
- YouTube보다 불안정함

### 파일 저장 위치
1. **로컬 임시**: `./downloads/` (서버)
2. **영구 저장**: Supabase Storage (`videos` 버킷)
3. **메타데이터**: Supabase PostgreSQL (`videos` 테이블)

### 품질 옵션
- `best`: 최고 품질 (이미 병합된 포맷 우선)
- `high`: 1080p 이하
- `medium`: 720p 이하
- `low`: 480p 이하

---

## 문제 해결

### 다운로드 실패 시
1. Python 및 yt-dlp 설치 확인
2. URL 형식 확인
3. 터미널 로그 확인
4. Supabase 연결 확인

### 데이터베이스 오류 시
1. Supabase 테이블 생성 확인
2. 환경 변수 확인
3. Service Role Key 권한 확인

### Storage 오류 시
1. `videos` 버킷 생성 확인
2. Public 설정 확인
3. 파일 경로 확인

---

**마지막 업데이트**: 2026-01-12
**작성자**: Antigravity AI
**프로젝트 상태**: 개발 완료 (버킷 생성 대기 중)
