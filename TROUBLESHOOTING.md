# 네이버 지도 API 인증 실패 - 문제 해결 체크리스트

## ✅ 이미 완료된 항목
- ✅ 웹 서비스 URL 등록 완료:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `https://propertyseoul.vercel.app/`

## 🔍 확인해야 할 사항들

### 1. Vercel 환경 변수 설정 확인

**Vercel Dashboard에서 확인:**
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** > **Environment Variables** 이동
4. 다음 변수가 **설정되어 있는지** 확인:
   ```
   VITE_NAVER_MAP_CLIENT_ID=zq4vqfkkot
   ```
5. **Environment**가 다음으로 설정되어 있는지 확인:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

**⚠️ 만약 설정되어 있지 않다면:**
- 변수를 추가하고 **반드시 Redeploy** 해야 함

### 2. 신규 Maps API로 전환 확인

**네이버 클라우드 플랫폼 콘솔에서:**
1. Application 상세 페이지 접속
2. **"API 유형"** 또는 **"서비스 유형"** 확인
3. 다음 중 하나여야 함:
   - ✅ "NAVER Maps JavaScript API v3"
   - ✅ "신규 Maps API"
   - ✅ "Maps API (신규)"

**❌ 만약 다음과 같다면 구버전입니다:**
- "AI NAVER API"
- "지도 API (구버전)"

**→ 신규 Application 생성 필요!**

### 3. 설정 반영 시간

웹 서비스 URL을 방금 등록했다면:
- ⏱️ **5-10분 정도 대기** 필요
- 설정이 서버에 반영되는 시간 필요

### 4. 브라우저 캐시 문제

**프로덕션 사이트 확인 시:**
1. 브라우저 **완전히 닫기**
2. **시크릿 모드**에서 접속 시도
3. 또는 **하드 리프레시**: `Ctrl+Shift+R` / `Cmd+Shift+R`

### 5. API URL 확인

현재 코드에서 사용 중인 URL:
- `https://oapi.map.naver.com/openapi/v3/maps.js`

이것이 올바른 신규 API URL입니다.

## 🔧 해결 단계별 체크리스트

### Step 1: Vercel 환경 변수
- [ ] Vercel Dashboard 접속
- [ ] Settings > Environment Variables 확인
- [ ] `VITE_NAVER_MAP_CLIENT_ID` 존재하는지 확인
- [ ] 없다면 추가 후 Redeploy

### Step 2: 신규 API 확인
- [ ] 네이버 클라우드 플랫폼 콘솔 접속
- [ ] Application이 신규 Maps API인지 확인
- [ ] 구버전이라면 신규 Application 생성

### Step 3: 재배포 및 대기
- [ ] Vercel에서 Redeploy 실행
- [ ] 5-10분 대기
- [ ] 시크릿 모드에서 확인

### Step 4: 브라우저 콘솔 확인
- [ ] 개발자 도구 (F12) 열기
- [ ] Console 탭 확인
- [ ] 정확한 에러 메시지 확인

## 🚨 여전히 안 되면

### Option 1: 신규 Application 생성

1. 네이버 클라우드 플랫폼 콘솔
2. **Application Service** > **Maps**
3. **Application 등록** (새로 생성)
4. **"NAVER Maps JavaScript API v3"** 선택
5. 새로운 Client ID 발급
6. 웹 서비스 URL 등록 (기존과 동일)
7. `.env` 파일에 새 Client ID 업데이트
8. Vercel 환경 변수 업데이트
9. Redeploy

### Option 2: 네이버 고객센터 문의

- 콘솔 내 고객센터
- 전화: 1588-3820
- 에러 메시지와 함께 문의

## 📊 현재 상태 점검

**웹 서비스 URL**: ✅ 완료
**로컬 환경 변수**: ✅ 확인 필요 (`.env` 파일)
**Vercel 환경 변수**: ⚠️ 확인 필요
**신규 API 전환**: ⚠️ 확인 필요
**설정 반영 시간**: ⚠️ 대기 중일 수 있음

