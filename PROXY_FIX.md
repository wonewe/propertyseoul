# 프록시 함수 500 에러 해결

## 현재 문제
프록시 함수(`/api/realtor`)에서 500 Internal Server Error가 발생하고 있습니다.

## 확인 방법

### Vercel 로그 확인
1. Vercel Dashboard 접속
2. 프로젝트 선택
3. **Functions** 탭 또는 **Deployments** 탭
4. 최신 배포 클릭
5. **Functions** 탭에서 `api/realtor` 함수 로그 확인
6. 에러 메시지 확인

## 가능한 원인

1. **fast-xml-parser 모듈 문제**
   - Vercel Serverless Function에서 모듈을 찾지 못할 수 있음
   - 해결: XML을 그대로 반환하도록 수정

2. **API 응답 문제**
   - 국토교통부 API가 에러를 반환할 수 있음
   - 해결: 에러 응답 처리 개선

3. **타임아웃**
   - API 호출이 너무 오래 걸릴 수 있음
   - 해결: 타임아웃 설정

## 임시 해결책

프록시를 사용하지 않고, 개발 환경처럼 직접 호출하도록 변경:

1. `src/services/realtorApi.ts`에서 프로덕션 환경 체크 제거
2. 항상 직접 호출하도록 변경

또는:

1. Vercel Dashboard에서 Functions 로그 확인
2. 정확한 에러 원인 파악
3. 해당 원인에 맞게 수정

## 다음 단계

1. Vercel Dashboard에서 Functions 로그 확인
2. 에러 메시지를 보고 정확한 원인 파악
3. 필요시 프록시 함수 수정

