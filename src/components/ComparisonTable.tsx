import type { Property } from '../types/property';
import './ComparisonTable.css';

interface ComparisonTableProps {
  properties: Property[];
  onRemove?: (propertyId: string) => void;
  onClear?: () => void;
}

export default function ComparisonTable({
  properties,
  onRemove,
  onClear,
}: ComparisonTableProps) {
  if (properties.length === 0) {
    return (
      <div className="comparison-empty">
        비교할 부동산을 선택해주세요.
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억`;
    }
    return `${price.toLocaleString()}만원`;
  };

  const calculatePricePerArea = (price: number, area: number) => {
    if (area === 0) return 0;
    return Math.round(price / area);
  };

  return (
    <div className="comparison-table-container">
      <div className="comparison-header">
        <h2>부동산 비교 ({properties.length}개)</h2>
        {onClear && properties.length > 0 && (
          <button className="clear-button" onClick={onClear}>
            모두 제거
          </button>
        )}
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>항목</th>
              {properties.map((property) => (
                <th key={property.id} className="property-column">
                  {onRemove && (
                    <button
                      className="remove-button"
                      onClick={() => onRemove(property.id)}
                      aria-label="제거"
                    >
                      ×
                    </button>
                  )}
                  <div className="property-header-content">
                    <div className="property-header-name">
                      {property.buildingName || property.address}
                    </div>
                    <div className="property-header-type">{property.buildingType}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="comparison-label">주소</td>
              {properties.map(property => (
                <td key={property.id}>{property.address}</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">면적</td>
              {properties.map(property => (
                <td key={property.id}>{property.area}m²</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">층수</td>
              {properties.map(property => (
                <td key={property.id}>{property.floor}층</td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">건축년도</td>
              {properties.map(property => (
                <td key={property.id}>
                  {property.constructionYear
                    ? `${property.constructionYear}년`
                    : '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">거래가격</td>
              {properties.map(property => (
                <td key={property.id} className="price-cell">
                  {formatPrice(property.price)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">㎡당 가격</td>
              {properties.map(property => (
                <td key={property.id} className="price-per-area">
                  {calculatePricePerArea(property.price, property.area).toLocaleString()}
                  만원/㎡
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label">거래일자</td>
              {properties.map(property => (
                <td key={property.id}>{property.dealDate}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

