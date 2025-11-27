# 🔴 네이버 지도 API 인증 실패 - 즉시 해결 방법

## 현재 상황
- 에러: `네이버 지도 Open API 인증이 실패하였습니다`
- Client ID: `zq4vqfkkot`
- 프로덕션 URL: `https://propertyseoul.vercel.app/`
- 개발 URL: `http://localhost:5173/`

## ✅ 해결 방법 (반드시 따라하세요!)

### 1단계: 네이버 클라우드 플랫폼 콘솔 접속
1. https://console.ncloud.com 접속 및 로그인

### 2단계: Application 찾기
1. 상단 메뉴에서 **Application** 또는 **Services** 클릭
2. **Application Service** > **Maps** 선택
3. Client ID `zq4vqfkkot`로 Application 검색
4. Application 클릭하여 상세 페이지로 이동

### 3단계: ⚠️ 웹 서비스 URL 등록 (가장 중요!)

**Application 상세 페이지에서:**

1. **"웹 서비스 URL"** 또는 **"Service URL"** 또는 **"URL 설정"** 섹션 찾기
   - 보통 페이지 하단이나 설정 탭에 있습니다

2. **"추가"** 또는 **"등록"** 버튼 클릭

3. **다음 URL들을 모두 추가** (각각 별도로 추가):
   ```
   http://localhost:5173
   ```
   ```
   http://127.0.0.1:5173
   ```
   ```
   https://propertyseoul.vercel.app
   ```
   (마지막 슬래시 없이도, 있어도 됩니다)

4. **"저장"** 또는 **"확인"** 클릭

5. ⏱️ **5-10분 정도 기다린 후** 재시도 (설정 반영 시간 필요)

### 4단계: 신규 Maps API 확인

**신규 API로 전환되었는지 확인:**
1. Application 상세 페이지에서 **"API 유형"** 또는 **"서비스 유형"** 확인
2. **"NAVER Maps JavaScript API v3"** 또는 **"신규 Maps API"** 여부 확인
3. 만약 구버전이라면:
   - 새 Application 생성 필요
   - 신규 Maps API로 신청
   - 새로운 Client ID 발급

### 5단계: 서비스 활성화 확인
- Maps 서비스가 **"활성"** 또는 **"사용 중"** 상태인지 확인
- 비활성화되어 있다면 **"활성화"** 버튼 클릭

### 6단계: 변경사항 적용
1. **Vercel 환경 변수 확인** (중요!)
   - Vercel Dashboard > 프로젝트 > Settings > Environment Variables
   - `VITE_NAVER_MAP_CLIENT_ID=zq4vqfkkot` 확인
   - 없다면 추가하고 **Redeploy** 실행

2. **Vercel 재배포**
   - Vercel Dashboard에서 **"Redeploy"** 클릭
   - 또는 Git에 커밋 후 자동 배포

3. **브라우저 캐시 클리어**
   - 개발자 도구 (F12) > Network 탭 > "Disable cache" 체크
   - 또는 하드 리프레시: `Ctrl+Shift+R` / `Cmd+Shift+R`

## 🔍 추가 확인 사항

### 환경 변수 확인
- **로컬 개발**: `.env` 파일 확인
- **Vercel 배포**: Vercel Dashboard > Settings > Environment Variables 확인

```env
VITE_NAVER_MAP_CLIENT_ID=zq4vqfkkot
```

### API URL 확인
현재 코드는 신규 API URL을 사용 중입니다:
- ✅ `https://oapi.map.naver.com/openapi/v3/maps.js`

### 신규 API로 전환 필요하다면
1. 네이버 클라우드 플랫폼 콘솔에서 새 Application 생성
2. **"NAVER Maps JavaScript API v3"** 선택
3. 신규 Client ID 발급
4. 웹 서비스 URL 등록 (위 3단계 참고)
5. `.env` 및 Vercel 환경 변수 업데이트

## 📞 여전히 안 되면

1. **네이버 클라우드 플랫폼 고객센터** 문의:
   - 콘솔 내 고객센터 또는 1588-3820

2. **신규 Application 생성 후 시도**:
   - 기존 Application이 구버전일 수 있음
   - 신규 Maps API로 새로 생성 권장

3. **에러 로그 확인**:
   - 브라우저 개발자 도구 (F12) > Console 탭
   - 정확한 에러 메시지 확인

## ✅ 체크리스트

- [ ] 웹 서비스 URL에 `http://localhost:5173` 추가됨
- [ ] 웹 서비스 URL에 `https://propertyseoul.vercel.app` 추가됨
- [ ] Vercel 환경 변수에 `VITE_NAVER_MAP_CLIENT_ID` 설정됨
- [ ] 신규 Maps API v3 사용 중인지 확인됨
- [ ] Maps 서비스 활성화 확인됨
- [ ] 5-10분 대기 후 재시도함
- [ ] Vercel 재배포 완료함

## 🎯 가장 중요한 것

**웹 서비스 URL 등록이 제대로 안 되어 있으면 절대 작동하지 않습니다!**

프로덕션 도메인(`https://propertyseoul.vercel.app`)을 반드시 등록해야 합니다.

