# 환경 변수 설정 가이드

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 API 키들을 설정하세요.

## 필수 API 키

### 1. 네이버 지도 API (신규 NAVER Maps JavaScript API v3) - 필수

⚠️ **중요**: AI NAVER API의 구버전 지도 API는 종료 예정입니다. 반드시 **신규 Maps API**로 전환해야 합니다.

**발급 방법:**
1. https://www.ncloud.com 접속 및 로그인
2. **Console** > **Application Service** > **Maps** 이동
3. 서비스 신청
4. **Application 등록** 클릭
5. **신규 Maps API** 서비스 활성화
6. 발급받은 **Client ID**를 복사

**⚠️ 웹 서비스 URL 등록 (필수!):**
- Application 상세 페이지에서 **웹 서비스 URL** 설정
- 개발 환경: `http://localhost:5173` 추가
- 개발 환경: `http://127.0.0.1:5173` 추가
- 운영 환경: 실제 도메인 추가

**`.env` 파일에 추가:**
```env
VITE_NAVER_MAP_CLIENT_ID=발급받은_신규_클라이언트_ID
```

**참고 링크:**
- 신규 API 가이드: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
- 공지사항: https://www.ncloud.com/support/notice/all/1930

### 2. 국토교통부 실거래가 API - 필수

**발급 방법:**
1. https://www.data.go.kr/data/15057511/openapi.do 방문
2. **활용신청** 버튼 클릭
3. 공공데이터포털 로그인 (회원가입 필요)
4. 신청 후 승인되면 **마이페이지** > **활용신청 현황**에서 API 키 확인
5. 발급받은 **인증키(서비스 키)**를 복사

**`.env` 파일에 추가:**
```env
VITE_REALTOR_API_KEY=발급받은_서비스_키
```

## 선택사항

### 3. 네이버 검색 API (선택)

현재 프로젝트에서는 사용하지 않지만, 향후 부가 정보 검색에 활용할 수 있습니다.

**발급 방법:**
1. https://developers.naver.com/apps/#/register 방문
2. 애플리케이션 등록
3. **검색 API** 선택
4. Client ID와 Client Secret 발급

**`.env` 파일에 추가:**
```env
VITE_NAVER_SEARCH_CLIENT_ID=발급받은_클라이언트_ID
VITE_NAVER_SEARCH_CLIENT_SECRET=발급받은_클라이언트_시크릿
```

## `.env` 파일 예시

프로젝트 루트에 `.env` 파일을 생성하고 아래 형식으로 작성하세요:

```env
# 필수 API 키
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id_here
VITE_REALTOR_API_KEY=your_realtor_api_key_here

# 선택사항
# VITE_NAVER_SEARCH_CLIENT_ID=your_naver_search_client_id_here
# VITE_NAVER_SEARCH_CLIENT_SECRET=your_naver_search_client_secret_here
```

## 주의사항

1. **`.env` 파일은 절대 Git에 커밋하지 마세요!** (이미 `.gitignore`에 포함되어 있습니다)
2. API 키가 없어도 샘플 데이터로 테스트할 수 있습니다
3. 환경 변수 변경 후 개발 서버를 **재시작**해야 반영됩니다

## 개발 서버 재시작

환경 변수를 변경한 후:

```bash
# 개발 서버 중지 (Ctrl+C)
# 그리고 다시 시작
npm run dev
```

