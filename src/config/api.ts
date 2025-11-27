// API 키 설정
// 실제 사용 시 환경 변수로 관리하세요
export const API_CONFIG = {
  // 국토교통부 실거래가 API
  // https://www.data.go.kr/data/15057511/openapi.do
  REALTOR_API_KEY: import.meta.env.VITE_REALTOR_API_KEY || '',
  
  // 네이버 지도 API
  // https://www.ncloud.com/product/applicationService/maps
  NAVER_MAP_CLIENT_ID: import.meta.env.VITE_NAVER_MAP_CLIENT_ID || '',
  
  // 네이버 검색 API
  NAVER_SEARCH_CLIENT_ID: import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID || '',
  NAVER_SEARCH_CLIENT_SECRET: import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET || '',
};

// 국토교통부 실거래가 API 기본 URL
export const REALTOR_API_BASE_URL = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc';

// 네이버 검색 API 기본 URL
export const NAVER_SEARCH_API_BASE_URL = 'https://openapi.naver.com/v1/search';

