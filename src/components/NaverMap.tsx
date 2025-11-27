import { useEffect, useRef, useState } from 'react';
import type { Property } from '../types/property';
import { API_CONFIG } from '../config/api';
import './NaverMap.css';

interface NaverMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  height?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function NaverMap({
  properties,
  selectedProperty,
  onPropertySelect,
  height = '500px',
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // 네이버 지도 API 로드
    if (!API_CONFIG.NAVER_MAP_CLIENT_ID) {
      setMapError('네이버 지도 API 키가 설정되지 않았습니다. .env 파일에 VITE_NAVER_MAP_CLIENT_ID를 추가하세요.');
      console.warn('네이버 지도 API 키가 설정되지 않았습니다.');
      return;
    }

    // 이미 스크립트가 로드되어 있는지 확인 (신규 API 포함)
    const existingScript = document.querySelector(`script[src*="oapi.map.naver.com"], script[src*="openapi.map.naver.com"]`);
    if (existingScript) {
      if (window.naver && window.naver.maps) {
        setMapLoaded(true);
      }
      return;
    }

    // 신규 NAVER Maps JavaScript API v3 사용
    // 가이드: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${API_CONFIG.NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    
    script.onload = () => {
      if (window.naver && window.naver.maps) {
        setMapLoaded(true);
        setMapError(null);
        console.log('네이버 지도 API 로드 성공');
      } else {
        setMapError('네이버 지도 API를 로드했지만 초기화에 실패했습니다. API 키와 서비스 설정을 확인하세요.');
      }
    };

    script.onerror = () => {
      setMapError(`네이버 지도 API 로드 실패. 다음을 확인하세요:

🔑 필수 확인 사항:
1. 신규 NAVER Maps JavaScript API v3로 전환되어 있는지 확인
   → 네이버 클라우드 플랫폼 콘솔에서 신규 Client ID 발급 필요

2. 웹 서비스 URL 등록 (중요!)
   → Application 설정 > 서비스 URL에 다음 추가:
   • http://localhost:5173
   • http://127.0.0.1:5173

3. API 키 확인
   → .env 파일의 VITE_NAVER_MAP_CLIENT_ID가 올바른지 확인
   → 현재 Client ID: ${API_CONFIG.NAVER_MAP_CLIENT_ID || '(설정되지 않음)'}

4. Maps 서비스 활성화
   → 네이버 클라우드 플랫폼에서 Maps 서비스 활성화 확인

📚 참고 링크:
• 신규 API 가이드: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
• 공지사항: https://www.ncloud.com/support/notice/all/1930`);
      console.error('네이버 지도 API 스크립트 로드 실패');
    };

    document.head.appendChild(script);

    return () => {
      // 스크립트 제거는 하지 않음 (다른 컴포넌트에서 사용 가능)
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.naver) return;

    // 서울 중심 좌표
    const seoulCenter = new window.naver.maps.LatLng(37.5665, 126.9780);

    // 지도 생성
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
        center: seoulCenter,
        zoom: 12,
      });
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 주소를 좌표로 변환하여 마커 표시
    if (properties.length > 0) {
      properties.forEach((property, index) => {
        // 좌표가 있는 경우 직접 사용
        if (property.latitude && property.longitude) {
          const position = new window.naver.maps.LatLng(
            property.latitude,
            property.longitude
          );
          createMarker(position, property, index);
        } else {
          // 좌표가 없는 경우 주소로 검색 (네이버 지오코딩 API 사용 가능)
          // 현재는 샘플 좌표 사용
          const sampleLat = 37.5665 + (Math.random() - 0.5) * 0.1;
          const sampleLng = 126.9780 + (Math.random() - 0.5) * 0.1;
          const position = new window.naver.maps.LatLng(sampleLat, sampleLng);
          createMarker(position, property, index);
        }
      });

      // 선택된 부동산이 있으면 해당 위치로 이동
      if (selectedProperty) {
        const lat = selectedProperty.latitude || 37.5665;
        const lng = selectedProperty.longitude || 126.9780;
        mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
        mapInstanceRef.current.setZoom(16);
      } else if (properties.length > 0) {
        // 모든 부동산이 보이도록 지도 범위 조정
        const bounds = new window.naver.maps.LatLngBounds();
        markersRef.current.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [mapLoaded, properties, selectedProperty]);

  const createMarker = (position: any, property: Property, index: number) => {
    const isSelected = selectedProperty?.id === property.id;

    const marker = new window.naver.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
      title: property.buildingName || property.address,
      icon: {
        content: `
          <div style="
            background-color: ${isSelected ? '#ff4444' : '#4CAF50'};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${index + 1}</div>
        `,
        anchor: new window.naver.maps.Point(15, 15),
      },
    });

    // 인포윈도우 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
            ${property.buildingName || property.address}
          </h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            ${property.address}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>${property.buildingType}</strong> | ${property.area}m²
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #e53935;">
            ${property.price.toLocaleString()}만원
          </p>
        </div>
      `,
    });

    // 마커 클릭 이벤트
    window.naver.maps.Event.addListener(marker, 'click', () => {
      if (onPropertySelect) {
        onPropertySelect(property);
      }
    });

    // 마커에 마우스 오버 시 인포윈도우 표시
    window.naver.maps.Event.addListener(marker, 'mouseover', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    window.naver.maps.Event.addListener(marker, 'mouseout', () => {
      infoWindow.close();
    });

    markersRef.current.push(marker);
  };

  if (!API_CONFIG.NAVER_MAP_CLIENT_ID) {
    return (
      <div className="naver-map-container" style={{ height }}>
        <div className="map-placeholder">
          <h3>⚠️ 네이버 지도 API 키가 설정되지 않았습니다</h3>
          <p>
            1. 프로젝트 루트에 <code>.env</code> 파일 생성<br />
            2. <code>VITE_NAVER_MAP_CLIENT_ID=발급받은_클라이언트_ID</code> 추가<br />
            3. 개발 서버 재시작
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="naver-map-container" style={{ height }}>
        <div className="map-placeholder">
          <h3>⚠️ 네이버 지도 로드 실패</h3>
          <pre style={{ 
            textAlign: 'left', 
            whiteSpace: 'pre-wrap',
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {mapError}
          </pre>
          <div style={{ marginTop: '16px', fontSize: '14px', textAlign: 'left', maxWidth: '600px' }}>
            <strong>🔴 인증 실패 - 해결 방법:</strong><br /><br />
            
            <strong>1. 웹 서비스 URL 등록 (가장 중요!)</strong><br />
            네이버 클라우드 플랫폼 콘솔에서:
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Application 상세 페이지 접속</li>
              <li><strong>"웹 서비스 URL"</strong> 섹션 찾기</li>
              <li>다음 URL 모두 추가 (각각 별도로):
                <ul style={{ marginTop: '4px' }}>
                  <li><code>http://localhost:5173</code></li>
                  <li><code>http://127.0.0.1:5173</code></li>
                  <li><strong>https://propertyseoul.vercel.app</strong> (프로덕션 필수!)</li>
                </ul>
              </li>
              <li>저장</li>
            </ol>
            
            <strong>2. 현재 Client ID 확인:</strong><br />
            <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
              {API_CONFIG.NAVER_MAP_CLIENT_ID || '(설정되지 않음)'}
            </code>
            <br />
            <strong>현재 도메인:</strong> {typeof window !== 'undefined' ? window.location.origin : '(확인 불가)'}
            <br /><br />
            
            <strong>3. 브라우저 및 서버 재시작:</strong><br />
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>브라우저 완전히 닫기</li>
              <li>개발 서버 재시작 (Ctrl+C 후 npm run dev)</li>
            </ul>
            <br />
            
            📋 <strong>상세 가이드:</strong> 프로젝트의 <code>NAVER_MAP_SETUP.md</code> 파일 참고<br />
            📚 <a href="https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html" target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3', textDecoration: 'underline' }}>신규 API 가이드</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="naver-map-container" style={{ height }}>
      <div ref={mapRef} className="naver-map" />
      {!mapLoaded && !mapError && (
        <div className="map-loading">지도를 불러오는 중...</div>
      )}
    </div>
  );
}

