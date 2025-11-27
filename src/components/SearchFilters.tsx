import { useState } from 'react';
import type { SearchFilters as SearchFiltersType } from '../types/property';
import './SearchFilters.css';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
  loading?: boolean;
}

const SEOUL_DISTRICTS = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
];

const BUILDING_TYPES = [
  { value: 'all', label: '전체' },
  { value: '아파트', label: '아파트' },
  { value: '오피스텔', label: '오피스텔' },
  { value: '연립다세대', label: '연립다세대' },
  { value: '단독다가구', label: '단독다가구' },
];

export default function SearchFilters({
  onSearch,
  loading = false,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>({
    district: '강남구',
    buildingType: 'all',
  });

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, district: e.target.value }));
  };

  const handleBuildingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, buildingType: e.target.value }));
  };

  const handleMinAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setFilters(prev => ({ ...prev, minArea: value }));
  };

  const handleMaxAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setFilters(prev => ({ ...prev, maxArea: value }));
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters(prev => ({ ...prev, minPrice: value }));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters(prev => ({ ...prev, maxPrice: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFiltersType = {
      district: '강남구',
      buildingType: 'all',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="search-filters">
      <form onSubmit={handleSubmit}>
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="district">지역</label>
            <select
              id="district"
              value={filters.district}
              onChange={handleDistrictChange}
            >
              {SEOUL_DISTRICTS.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="buildingType">건물 유형</label>
            <select
              id="buildingType"
              value={filters.buildingType}
              onChange={handleBuildingTypeChange}
            >
              {BUILDING_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="minArea">면적 (㎡)</label>
            <div className="range-inputs">
              <input
                id="minArea"
                type="number"
                placeholder="최소"
                value={filters.minArea || ''}
                onChange={handleMinAreaChange}
                min="0"
                step="0.1"
              />
              <span>~</span>
              <input
                id="maxArea"
                type="number"
                placeholder="최대"
                value={filters.maxArea || ''}
                onChange={handleMaxAreaChange}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="minPrice">가격 (만원)</label>
            <div className="range-inputs">
              <input
                id="minPrice"
                type="number"
                placeholder="최소"
                value={filters.minPrice || ''}
                onChange={handleMinPriceChange}
                min="0"
                step="100"
              />
              <span>~</span>
              <input
                id="maxPrice"
                type="number"
                placeholder="최대"
                value={filters.maxPrice || ''}
                onChange={handleMaxPriceChange}
                min="0"
                step="100"
              />
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </button>
          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
            disabled={loading}
          >
            초기화
          </button>
        </div>
      </form>
    </div>
  );
}

