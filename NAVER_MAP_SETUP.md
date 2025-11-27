# 네이버 지도 API 인증 실패 해결 가이드

## 🔴 현재 에러
```
네이버 지도 Open API 인증이 실패하였습니다.
Error Code: 200 / Authentication Failed
Client ID: zq4vqfkkot
URI: http://localhost:5173/
```

## ✅ 해결 방법 (단계별)

### 1단계: 네이버 클라우드 플랫폼 콘솔 접속
1. https://console.ncloud.com 접속
2. 로그인

### 2단계: Application 찾기
1. 상단 메뉴: **Application** 또는 **Services** 클릭
2. **Application Service** > **Maps** 선택
3. Client ID `zq4vqfkkot`로 Application 찾기
4. Application 이름 클릭하여 상세 페이지로 이동

### 3단계: 웹 서비스 URL 등록 (⚠️ 가장 중요!)

Application 상세 페이지에서:

1. **"웹 서비스 URL"** 또는 **"Service URL"** 섹션 찾기
2. **"추가"** 또는 **"등록"** 버튼 클릭
3. 다음 URL들을 추가 (각각 별도로 추가):
   ```
   http://localhost:5173
   ```
   ```
   http://127.0.0.1:5173
   ```
4. **"저장"** 또는 **"확인"** 클릭

### 4단계: 서비스 활성화 확인
- Maps 서비스가 **활성화**되어 있는지 확인
- 만약 비활성화되어 있다면 **"활성화"** 클릭

### 5단계: 변경사항 적용
1. 브라우저 **완전히 닫기** (모든 탭)
2. 브라우저 **재실행**
3. 개발 서버 재시작:
   ```bash
   # Ctrl+C로 서버 중지
   npm run dev
   ```
4. http://localhost:5173 접속

## 🔍 추가 확인 사항

### Client ID 확인
- `.env` 파일에서 Client ID 확인:
  ```env
  VITE_NAVER_MAP_CLIENT_ID=zq4vqfkkot
  ```
- 네이버 클라우드 플랫폼 콘솔의 Client ID와 일치하는지 확인

### 신규 API 확인
- 구버전 AI NAVER API가 아닌 **신규 NAVER Maps JavaScript API v3** 사용 중인지 확인
- 신규 API를 사용하려면 새 Application 생성 필요할 수 있음

### 브라우저 캐시 클리어
- 개발자 도구 열기 (F12)
- Network 탭에서 **"Disable cache"** 체크
- 또는 하드 리프레시: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

## 📞 여전히 안 되면

1. **네이버 클라우드 플랫폼 고객센터** 문의
2. **신규 Application 생성** 시도:
   - Application Service > Maps > Application 등록
   - 새로운 Client ID 발급
   - 웹 서비스 URL 등록
   - .env 파일에 새 Client ID 업데이트

## 💡 참고

- 웹 서비스 URL은 정확히 일치해야 합니다 (`http://localhost:5173/` vs `http://localhost:5173`)
- 개발 서버를 다른 포트에서 실행하는 경우 해당 포트도 등록해야 합니다
- 운영 환경 배포 시 실제 도메인도 등록해야 합니다

