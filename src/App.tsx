import { useState, useEffect, useMemo } from 'react';
import type { Property, SearchFilters } from './types/property';
import SearchFiltersComponent from './components/SearchFilters';
import { fetchRealtorData } from './services/realtorApi';
import NaverMap from './components/NaverMap';
import PropertyCard from './components/PropertyCard';
import ComparisonTable from './components/ComparisonTable';
import './App.css';

function App() {
  console.log('App 컴포넌트 렌더링 시작');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    district: '강남구',
    buildingType: 'all',
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.log('App 상태:', { propertiesCount: properties.length, loading, error });

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSelectedProperty(null);
    setCurrentFilters(filters);

    try {
      const data = await fetchRealtorData(filters.district);
      setProperties(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch({ district: '강남구', buildingType: 'all' }).catch(err => {
      console.error('Initial load error:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 필터 적용
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // 건물 유형 필터
    if (currentFilters.buildingType && currentFilters.buildingType !== 'all') {
      filtered = filtered.filter(
        p => p.buildingType === currentFilters.buildingType
      );
    }

    // 면적 필터
    if (currentFilters.minArea !== undefined) {
      filtered = filtered.filter(p => p.area >= currentFilters.minArea!);
    }
    if (currentFilters.maxArea !== undefined) {
      filtered = filtered.filter(p => p.area <= currentFilters.maxArea!);
    }

    // 가격 필터
    if (currentFilters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= currentFilters.minPrice!);
    }
    if (currentFilters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= currentFilters.maxPrice!);
    }

    return filtered;
  }, [properties, currentFilters]);

  // 비교할 부동산 추가
  const handleAddToComparison = (property: Property) => {
    if (comparedProperties.some(p => p.id === property.id)) {
      return; // 이미 추가된 경우
    }
    setComparedProperties(prev => [...prev, property]);
  };

  // 비교에서 제거
  const handleRemoveFromComparison = (propertyId: string) => {
    setComparedProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  // 비교 모두 제거
  const handleClearComparison = () => {
    setComparedProperties([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 서울 부동산 비교</h1>
        <p>서울시 부동산 실거래가 정보를 확인하고 비교해보세요</p>
      </header>

      <main className="app-main">
        <div className="app-container">
          {/* 검색 필터 */}
          <SearchFiltersComponent onSearch={handleSearch} loading={loading} />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="content-grid">
            {/* 왼쪽: 지도 */}
            <div className="map-section">
              <h2>지도</h2>
              <NaverMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                height="600px"
              />
            </div>

            {/* 오른쪽: 부동산 목록 */}
            <div className="list-section">
              <h2>부동산 목록 ({filteredProperties.length}개)</h2>
              {loading ? (
                <div className="loading">데이터를 불러오는 중...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="empty">검색 결과가 없습니다.</div>
              ) : (
                <div className="property-list">
                  {filteredProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isSelected={selectedProperty?.id === property.id}
                      onSelect={setSelectedProperty}
                      onCompare={handleAddToComparison}
                      showCompareButton={!comparedProperties.some(p => p.id === property.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 비교 테이블 */}
          {comparedProperties.length > 0 && (
            <ComparisonTable
              properties={comparedProperties}
              onRemove={handleRemoveFromComparison}
              onClear={handleClearComparison}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          데이터 출처: 국토교통부 실거래가 공개시스템
          {' | '}
          <a
            href="https://www.data.go.kr/data/15057511/openapi.do"
            target="_blank"
            rel="noopener noreferrer"
          >
            API 문서
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
