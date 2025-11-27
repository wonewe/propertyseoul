import axios from 'axios';
import type { Property } from '../types/property';
import { REALTOR_API_BASE_URL, API_CONFIG } from '../config/api';

// 구 코드 매핑 (예시 - 실제 API 문서 참조 필요)
const DISTRICT_CODE_MAP: Record<string, string> = {
  '강남구': '11680',
  '강동구': '11740',
  '강북구': '11305',
  '강서구': '11500',
  '관악구': '11620',
  '광진구': '11215',
  '구로구': '11530',
  '금천구': '11545',
  '노원구': '11350',
  '도봉구': '11320',
  '동대문구': '11230',
  '동작구': '11590',
  '마포구': '11440',
  '서대문구': '11410',
  '서초구': '11650',
  '성동구': '11200',
  '성북구': '11290',
  '송파구': '11710',
  '양천구': '11470',
  '영등포구': '11560',
  '용산구': '11170',
  '은평구': '11380',
  '종로구': '11110',
  '중구': '11140',
  '중랑구': '11260',
};

interface RealtorApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: any[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 날짜를 API 형식으로 변환 (YYYYMM)
 */
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * API 응답 데이터를 Property 객체로 변환
 */
function transformApiResponseToProperty(item: any, district: string): Property {
  return {
    id: `${item.일련번호 || item.serialNumber || Date.now()}-${Math.random()}`,
    address: item.법정동 || item.roadAddress || '',
    addressDetail: item.지번 || '',
    district: district,
    dong: item.법정동 || item.dong || '',
    buildingName: item.아파트 || item.연립다세대 || item.buildingName || '',
    buildingType: determineBuildingType(item),
    area: parseFloat(item.전용면적 || item.area || '0'),
    floor: parseInt(item.층 || item.floor || '0'),
    price: parseInt(item.거래금액?.replace(/,/g, '') || item.price || '0'),
    dealDate: item.년 || item.월 || item.dealDate || '',
    constructionYear: parseInt(item.건축년도 || item.constructionYear || '0'),
  };
}

/**
 * 건물 타입 판단
 */
function determineBuildingType(item: any): Property['buildingType'] {
  if (item.아파트 || item.apartment) return '아파트';
  if (item.오피스텔 || item.officetel) return '오피스텔';
  if (item.연립다세대 || item.multiFamily) return '연립다세대';
  return '단독다가구';
}

/**
 * 서울 특정 구의 실거래가 데이터 조회
 */
export async function fetchRealtorData(
  district: string,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<Property[]> {
  try {
    const districtCode = DISTRICT_CODE_MAP[district];
    if (!districtCode) {
      throw new Error(`지원하지 않는 구: ${district}`);
    }

    const dealYmd = formatDateForAPI(new Date(year, month - 1));
    
    // 프로덕션 환경(HTTPS)에서는 Vercel Serverless Function 프록시 사용
    // 개발 환경에서는 직접 호출
    const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    const params = {
      serviceKey: API_CONFIG.REALTOR_API_KEY,
      LAWD_CD: districtCode,
      DEAL_YMD: dealYmd,
      numOfRows: 100,
      pageNo: 1,
    };

    let url: string;
    if (isProduction) {
      // 프로덕션: Vercel Serverless Function 프록시 사용
      const proxyUrl = `${window.location.origin}/api/realtor`;
      url = proxyUrl;
    } else {
      // 개발: 직접 호출 (HTTP 허용)
      url = `${REALTOR_API_BASE_URL.replace('https://', 'http://')}/getRTMSDataSvcAptTradeDev`;
    }

    const response = await axios.get<RealtorApiResponse>(url, { params });
    
    if (response.data.response.header.resultCode !== '00') {
      throw new Error(response.data.response.header.resultMsg);
    }

    const items = response.data.response.body.items?.item || [];
    
    // 단일 객체인 경우 배열로 변환
    const itemArray = Array.isArray(items) ? items : [items];
    
    return itemArray
      .filter(item => item != null)
      .map(item => transformApiResponseToProperty(item, district));
  } catch (error) {
    console.error('부동산 데이터 조회 실패:', error);
    // API 키가 없거나 오류 발생 시 샘플 데이터 반환
    return getSampleData(district);
  }
}

/**
 * 샘플 데이터 (API 키가 없거나 오류 발생 시 사용)
 */
function getSampleData(district: string): Property[] {
  const sampleProperties: Property[] = [
    {
      id: '1',
      address: `${district} 테헤란로 123`,
      district: district,
      dong: '역삼동',
      buildingName: '역삼 아파트',
      buildingType: '아파트',
      area: 84.5,
      floor: 5,
      price: 120000,
      dealDate: '2024-01-15',
      constructionYear: 2015,
      latitude: 37.5010,
      longitude: 127.0390,
    },
    {
      id: '2',
      address: `${district} 강남대로 456`,
      district: district,
      dong: '역삼동',
      buildingName: '강남 오피스텔',
      buildingType: '오피스텔',
      area: 45.2,
      floor: 10,
      price: 85000,
      dealDate: '2024-01-20',
      constructionYear: 2020,
      latitude: 37.4980,
      longitude: 127.0270,
    },
    {
      id: '3',
      address: `${district} 선릉로 789`,
      district: district,
      dong: '역삼동',
      buildingName: '선릉 연립다세대',
      buildingType: '연립다세대',
      area: 72.8,
      floor: 3,
      price: 95000,
      dealDate: '2024-02-01',
      constructionYear: 2018,
      latitude: 37.5040,
      longitude: 127.0490,
    },
  ];
  
  return sampleProperties;
}

/**
 * 여러 구의 데이터를 동시에 조회
 */
export async function fetchMultipleDistricts(
  districts: string[],
  year?: number,
  month?: number
): Promise<Property[]> {
  const promises = districts.map(district => fetchRealtorData(district, year, month));
  const results = await Promise.all(promises);
  return results.flat();
}

