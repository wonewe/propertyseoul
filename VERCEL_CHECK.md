# Vercel 프록시 함수 500 에러 확인 방법

## 즉시 확인할 것

### Vercel Dashboard에서 Functions 로그 확인

1. https://vercel.com/dashboard 접속
2. `propertyseoul` 프로젝트 선택
3. **Deployments** 탭 이동
4. 최신 배포 클릭 (가장 위에 있는 것)
5. **Functions** 탭 클릭
6. `api/realtor` 함수 찾기
7. **"View Function Logs"** 또는 로그 아이콘 클릭
8. 에러 메시지 확인

## 예상되는 에러 원인

1. **모듈 import 실패**: `fast-xml-parser`가 제대로 설치되지 않았을 수 있음
2. **타임아웃**: API 호출이 너무 오래 걸림
3. **XML 파싱 에러**: XML 형식이 예상과 다름
4. **환경 변수**: API 키가 전달되지 않음

## 해결 방법

로그를 확인한 후 정확한 원인을 알려주시면 수정하겠습니다!

또는:

1. 프록시 함수를 더 단순하게 만들어서 테스트
2. 에러 처리를 더 상세하게 추가
3. 단계별로 로그 출력

