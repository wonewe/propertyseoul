export interface Property {
  id: string;
  address: string;
  addressDetail?: string;
  district: string; // 구/군
  dong: string; // 동
  buildingName?: string;
  buildingType: '아파트' | '오피스텔' | '연립다세대' | '단독다가구';
  area: number; // 면적 (m²)
  floor: number; // 층수
  price: number; // 거래가격 (만원)
  dealDate: string; // 거래일자
  constructionYear?: number; // 건축년도
  latitude?: number;
  longitude?: number;
}

export interface PropertyComparison {
  properties: Property[];
}

export interface NaverMapConfig {
  clientId: string;
  clientSecret?: string;
}

export interface SearchFilters {
  district: string;
  buildingType: string;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
}
