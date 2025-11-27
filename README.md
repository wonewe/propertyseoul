# 서울 부동산 비교 웹사이트

서울시 부동산 실거래가 정보를 확인하고 비교할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🗺️ **네이버 지도 연동**: 부동산 위치를 지도에서 확인
- 🔍 **지역별 검색**: 서울시 25개 구 단위 검색
- 📊 **부동산 비교**: 여러 부동산을 선택하여 비교 분석
- 📈 **실거래가 정보**: 국토교통부 실거래가 데이터 활용
- 📱 **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** (빌드 도구)
- **네이버 지도 API** (지도 표시)
- **국토교통부 실거래가 API** (부동산 데이터)
- **Axios** (API 호출)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 API 키를 설정하세요:

```env
VITE_REALTOR_API_KEY=your_realtor_api_key_here
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id_here
```

#### API 키 발급 방법

**국토교통부 실거래가 API**
1. https://www.data.go.kr/data/15057511/openapi.do 방문
2. API 키 신청 및 발급

**네이버 지도 API**
1. https://www.ncloud.com/product/applicationService/maps 방문
2. NCP 계정 생성 및 지도 API 서비스 신청
3. 클라이언트 ID 발급

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 으로 접속하세요.

### 4. 빌드

```bash
npm run build
```

## 사용 방법

1. **검색**: 상단 검색 필터에서 지역, 건물 유형, 면적, 가격 범위를 설정하고 검색
2. **지도 확인**: 왼쪽 지도에서 부동산 위치를 확인하고 마커를 클릭하여 상세 정보 확인
3. **비교**: 부동산 카드의 "비교" 버튼을 클릭하여 비교 목록에 추가
4. **분석**: 하단 비교 테이블에서 선택한 부동산들을 한눈에 비교

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── NaverMap.tsx    # 네이버 지도 컴포넌트
│   ├── PropertyCard.tsx # 부동산 카드 컴포넌트
│   ├── ComparisonTable.tsx # 비교 테이블 컴포넌트
│   └── SearchFilters.tsx   # 검색 필터 컴포넌트
├── services/           # API 서비스
│   └── realtorApi.ts   # 국토교통부 API 연동
├── types/              # TypeScript 타입 정의
│   └── property.ts
├── config/             # 설정 파일
│   └── api.ts
└── App.tsx            # 메인 앱 컴포넌트
```

## 주의사항

- API 키가 설정되지 않은 경우 샘플 데이터가 표시됩니다
- 실제 API를 사용하려면 반드시 API 키를 발급받아 `.env` 파일에 설정하세요
- 국토교통부 API는 일일 호출 제한이 있을 수 있습니다

## 라이선스

MIT
