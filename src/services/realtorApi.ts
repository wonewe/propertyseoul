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

// 구별 중심 좌표 (네이버 지도 기준)
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '강남구': { lat: 37.5172, lng: 127.0473 },
  '강동구': { lat: 37.5301, lng: 127.1237 },
  '강북구': { lat: 37.6396, lng: 127.0257 },
  '강서구': { lat: 37.5509, lng: 126.8497 },
  '관악구': { lat: 37.4784, lng: 126.9516 },
  '광진구': { lat: 37.5385, lng: 127.0823 },
  '구로구': { lat: 37.4954, lng: 126.8874 },
  '금천구': { lat: 37.4568, lng: 126.8954 },
  '노원구': { lat: 37.6542, lng: 127.0568 },
  '도봉구': { lat: 37.6688, lng: 127.0471 },
  '동대문구': { lat: 37.5744, lng: 127.0400 },
  '동작구': { lat: 37.5124, lng: 126.9393 },
  '마포구': { lat: 37.5663, lng: 126.9016 },
  '서대문구': { lat: 37.5791, lng: 126.9368 },
  '서초구': { lat: 37.4837, lng: 127.0324 },
  '성동구': { lat: 37.5633, lng: 127.0371 },
  '성북구': { lat: 37.5891, lng: 127.0182 },
  '송파구': { lat: 37.5145, lng: 127.1066 },
  '양천구': { lat: 37.5169, lng: 126.8660 },
  '영등포구': { lat: 37.5264, lng: 126.8962 },
  '용산구': { lat: 37.5326, lng: 126.9900 },
  '은평구': { lat: 37.6027, lng: 126.9291 },
  '종로구': { lat: 37.5730, lng: 126.9794 },
  '중구': { lat: 37.5641, lng: 126.9979 },
  '중랑구': { lat: 37.6066, lng: 127.0927 },
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
 * 문자열을 해시하여 0~1 사이의 값을 반환
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (Math.abs(hash) % 1000) / 1000;
}

/**
 * API 응답 데이터를 Property 객체로 변환
 */
function transformApiResponseToProperty(item: any, district: string): Property {
  // XML 태그 매핑 (apis.data.go.kr 기준)
  // aptNm: 아파트명
  // dealAmount: 거래금액 (콤마 포함 문자열)
  // excluUseAr: 전용면적
  // floor: 층
  // dealYear/Month/Day: 거래일
  // buildYear: 건축년도
  // umdNm: 법정동
  // jibun: 지번

  // 안전한 파싱을 위해 문자열 변환 후 숫자만 추출
  const dealAmountStr = String(item.dealAmount || item.거래금액 || '0').trim();
  const price = parseInt(dealAmountStr.replace(/[^0-9]/g, '')); // 콤마 등 숫자 외 문자 제거

  const year = String(item.dealYear || item.년 || '').trim();
  const month = String(item.dealMonth || item.월 || '').trim().padStart(2, '0');
  const day = String(item.dealDay || item.일 || '').trim().padStart(2, '0');

  const areaStr = String(item.excluUseAr || item.전용면적 || item.area || '0').trim();
  const area = parseFloat(areaStr);

  const floorStr = String(item.floor || item.층 || '0').trim();
  const floor = parseInt(floorStr);

  const buildYearStr = String(item.buildYear || item.건축년도 || item.constructionYear || '0').trim();
  const buildYear = parseInt(buildYearStr);

  const address = String(item.umdNm || item.법정동 || item.roadAddress || '').trim();
  const buildingName = String(item.aptNm || item.아파트 || item.연립다세대 || item.buildingName || '').trim();
  const jibun = String(item.jibun || item.지번 || '').trim();

  // 좌표 생성 (결정론적 랜덤)
  const center = DISTRICT_COORDINATES[district] || { lat: 37.5665, lng: 126.9780 };
  // 주소+건물명을 시드로 사용하여 항상 같은 위치에 표시되도록 함
  // 범위: 중심점 기준 약 ±0.02도 (약 2km)
  const latOffset = (stringToHash(address + buildingName + 'lat') - 0.5) * 0.04;
  const lngOffset = (stringToHash(address + buildingName + 'lng') - 0.5) * 0.04;

  return {
    id: `${item.일련번호 || item.serialNumber || Date.now()}-${Math.random()}`,
    address: address,
    addressDetail: jibun,
    district: district,
    dong: address,
    buildingName: buildingName,
    buildingType: determineBuildingType(item),
    area: isNaN(area) ? 0 : area,
    floor: isNaN(floor) ? 0 : floor,
    price: isNaN(price) ? 0 : price,
    dealDate: (year && month && day) ? `${year}-${month}-${day}` : (item.dealDate || ''),
    constructionYear: isNaN(buildYear) ? 0 : buildYear,
    latitude: center.lat + latOffset,
    longitude: center.lng + lngOffset,
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
    let response: any;

    if (isProduction) {
      // 프로덕션: Vercel Serverless Function 프록시 사용
      const proxyUrl = `${window.location.origin}/api/realtor`;

      // XML 응답 처리
      const xmlResponse = await fetch(`${proxyUrl}?${new URLSearchParams({
        serviceKey: params.serviceKey,
        LAWD_CD: params.LAWD_CD,
        DEAL_YMD: params.DEAL_YMD,
        numOfRows: String(params.numOfRows),
        pageNo: String(params.pageNo),
      }).toString()}`);

      if (!xmlResponse.ok) {
        // 에러 응답 시 JSON인지 확인
        const contentType = xmlResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await xmlResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `HTTP ${xmlResponse.status}: ${xmlResponse.statusText}`);
        } else {
          const errorText = await xmlResponse.text().catch(() => '');
          throw new Error(`프록시 에러 (${xmlResponse.status}): ${errorText || xmlResponse.statusText}`);
        }
      }

      const xmlText = await xmlResponse.text();

      // XML을 JSON으로 변환
      try {
        const { XMLParser } = await import('fast-xml-parser');
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          textNodeName: '#text',
          parseAttributeValue: true,
        });

        const jsonData = parser.parse(xmlText);

        // DEBUG: Log raw XML and parsed JSON
        console.log('Raw XML:', xmlText);
        console.log('Parsed JSON:', jsonData);

        if (jsonData?.response?.body?.items?.item) {
          const firstItem = Array.isArray(jsonData.response.body.items.item)
            ? jsonData.response.body.items.item[0]
            : jsonData.response.body.items.item;
          console.log('First Item Keys:', Object.keys(firstItem));
          console.log('First Item:', firstItem);
        }

        response = { data: jsonData };
      } catch (parseError) {
        console.error('XML 파싱 실패:', parseError);
        // XML 파싱 실패 시 샘플 데이터 반환
        return getSampleData(district);
      }
    } else {
      // 개발: 직접 호출 (HTTP 허용)
      url = `${REALTOR_API_BASE_URL.replace('https://', 'http://')}/getRTMSDataSvcAptTradeDev`;
      response = await axios.get<RealtorApiResponse>(url, { params });
    }

    const resultCode = response.data.response.header.resultCode;
    // '00', '000', 0 모두 성공으로 처리
    const codeStr = String(resultCode).trim();
    if (codeStr !== '00' && codeStr !== '000' && resultCode !== 0) {
      throw new Error(response.data.response.header.resultMsg);
    }

    const items = response.data.response.body.items?.item || [];

    // 단일 객체인 경우 배열로 변환
    const itemArray = Array.isArray(items) ? items : [items];

    const transformedItems = itemArray
      .filter(item => item != null)
      .map(item => transformApiResponseToProperty(item, district));

    console.log('Transformed Items (First 2):', transformedItems.slice(0, 2));

    return transformedItems;
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

