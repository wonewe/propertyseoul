# Vercel 배포 설정 가이드

## 네이버 지도 API 인증 실패 해결

현재 프로덕션 사이트(`https://propertyseoul.vercel.app/`)에서 네이버 지도 API 인증이 실패하고 있습니다.

## 🔴 문제 원인

1. **프로덕션 도메인이 웹 서비스 URL에 등록되지 않음**
2. **Vercel 환경 변수가 설정되지 않았을 수 있음**

## ✅ 해결 방법

### 1단계: 네이버 클라우드 플랫폼 - 웹 서비스 URL 등록

1. https://console.ncloud.com 접속
2. **Application Service** > **Maps** > Application 선택 (Client ID: `zq4vqfkkot`)
3. **웹 서비스 URL** 섹션에서 다음 URL 추가:
   ```
   https://propertyseoul.vercel.app
   ```
   (마지막 슬래시 없이)
4. **저장** 클릭
5. ⏱️ **5-10분 대기** (설정 반영 시간)

### 2단계: Vercel 환경 변수 설정

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 (`propertyseoul`)
3. **Settings** > **Environment Variables** 이동
4. 다음 환경 변수 추가:
   ```
   Name: VITE_NAVER_MAP_CLIENT_ID
   Value: zq4vqfkkot
   ```
5. **Environment** 선택:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. **Save** 클릭

### 3단계: Vercel 재배포

**방법 1: Dashboard에서 재배포**
1. Vercel Dashboard에서 프로젝트 선택
2. **Deployments** 탭
3. 최신 배포의 **"..."** 메뉴 클릭
4. **"Redeploy"** 선택
5. **"Redeploy"** 확인

**방법 2: Git 커밋으로 자동 배포**
```bash
# 아무 파일이나 수정 후 커밋
git add .
git commit -m "Trigger redeploy"
git push
```

### 4단계: 확인

1. **5-10분 후** https://propertyseoul.vercel.app/ 접속
2. 브라우저 개발자 도구 (F12) > Console 확인
3. 네이버 지도가 정상적으로 표시되는지 확인

## 🔍 추가 확인 사항

### Vercel 환경 변수 확인

Dashboard에서 다음 변수들이 설정되어 있는지 확인:
- `VITE_NAVER_MAP_CLIENT_ID=zq4vqfkkot`
- `VITE_REALTOR_API_KEY=...` (선택사항)

### 환경 변수 변경 후 재배포 필수

환경 변수를 추가/수정한 후에는 **반드시 재배포**해야 합니다!

## 📝 체크리스트

- [ ] 네이버 클라우드 플랫폼에 `https://propertyseoul.vercel.app` 추가됨
- [ ] Vercel에 `VITE_NAVER_MAP_CLIENT_ID` 환경 변수 설정됨
- [ ] Vercel 재배포 완료됨
- [ ] 5-10분 대기 후 확인함

## 🚨 여전히 안 되면

1. **신규 Maps API로 전환**:
   - 구버전 API를 사용 중일 수 있음
   - 네이버 클라우드 플랫폼에서 신규 Application 생성 필요

2. **Vercel 로그 확인**:
   - Dashboard > Deployments > 최신 배포 > Functions 탭
   - 에러 로그 확인

3. **네이버 클라우드 플랫폼 고객센터 문의**:
   - 콘솔 내 고객센터
   - 전화: 1588-3820

