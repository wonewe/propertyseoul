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
    // 주의: 신규 API에서는 ncpClientId 대신 ncpKeyId 사용
    const script = document.createElement('script');
    script.type = 'text/javascript';
    // geocoder 서브모듈 추가
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${API_CONFIG.NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
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
        zoom: 14, // 줌 레벨 조정
      });
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 주소를 좌표로 변환하여 마커 표시
    if (properties.length > 0) {
      properties.forEach((property) => {
        // 초기에는 결정론적 랜덤 좌표 사용 (빠른 렌더링)
        const position = new window.naver.maps.LatLng(
          property.latitude || 37.5665,
          property.longitude || 126.9780
        );

        const marker = createMarker(position, property);

        // 실제 주소로 지오코딩 시도 (정확한 위치)
        // 주의: 대량 요청 시 429 에러 발생 가능하므로 순차적으로 처리하거나 딜레이 필요할 수 있음
        // 여기서는 개별적으로 시도
        if (window.naver.maps.Service && window.naver.maps.Service.geocode) {
          const query = property.addressDetail
            ? `${property.address} ${property.addressDetail}`
            : property.address;

          window.naver.maps.Service.geocode({
            query: query
          }, (status: any, response: any) => {
            if (status === window.naver.maps.Service.Status.OK) {
              const result = response.v2.addresses[0];
              if (result) {
                const newPosition = new window.naver.maps.LatLng(result.y, result.x);
                marker.setPosition(newPosition);
              }
            } else {
              // 지오코딩 실패 시 (주소 불명확 등) 기존 좌표 유지
              // console.warn('Geocoding failed for:', query);
            }
          });
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
        // 지오코딩이 비동기라 초기에는 랜덤 좌표 기준일 수 있음
        const bounds = new window.naver.maps.LatLngBounds();
        markersRef.current.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [mapLoaded, properties, selectedProperty]);

  const createMarker = (position: any, property: Property) => {
    const isSelected = selectedProperty?.id === property.id;

    const marker = new window.naver.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
      title: property.buildingName || property.address,
      icon: {
        content: `
          <div style="
            position: relative;
            cursor: pointer;
            transition: transform 0.2s;
            z-index: ${isSelected ? 100 : 1};
          ">
            <div style="
              background-color: ${isSelected ? '#2563eb' : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#1e293b'};
              padding: 6px 10px;
              border-radius: 20px;
              font-weight: 700;
              font-size: 13px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 2px solid ${isSelected ? '#ffffff' : '#2563eb'};
              display: flex;
              align-items: center;
              justify-content: center;
              white-space: nowrap;
            ">
              ${property.price >= 10000 ? `${(property.price / 10000).toFixed(1)}억` : `${property.price.toLocaleString()}`}
            </div>
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid ${isSelected ? '#ffffff' : '#2563eb'};
            "></div>
          </div>
        `,
        anchor: new window.naver.maps.Point(20, 35),
      },
    });

    // 인포윈도우 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="
          padding: 16px;
          min-width: 240px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: none;
          font-family: 'Pretendard', sans-serif;
        ">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.4;
          ">
            ${property.buildingName || property.address}
          </h3>
          <p style="
            margin: 0 0 12px 0;
            font-size: 13px;
            color: #64748b;
            line-height: 1.4;
          ">
            ${property.address}
          </p>
          <div style="
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
          ">
            <span style="
              background: #f1f5f9;
              color: #475569;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            ">${property.buildingType}</span>
            <span style="
              background: #f1f5f9;
              color: #475569;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            ">${property.area}m² (${Math.round(property.area * 0.3025)}평)</span>
            <span style="
              background: #f1f5f9;
              color: #475569;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            ">${property.floor}층</span>
          </div>
          <p style="
            margin: 0;
            font-size: 18px;
            font-weight: 800;
            color: #2563eb;
            text-align: right;
          ">
            ${property.price >= 10000 ? `${(property.price / 10000).toFixed(1)}억` : `${property.price.toLocaleString()}만원`}
          </p>
        </div>
      `,
      borderWidth: 0,
      backgroundColor: "transparent",
      anchorSize: new window.naver.maps.Size(0, 0),
      pixelOffset: new window.naver.maps.Point(0, -10),
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
    return marker;
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

