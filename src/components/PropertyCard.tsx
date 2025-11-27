import type { Property } from '../types/property';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: (property: Property) => void;
  onCompare?: (property: Property) => void;
  showCompareButton?: boolean;
}

export default function PropertyCard({
  property,
  isSelected = false,
  onSelect,
  onCompare,
  showCompareButton = true,
}: PropertyCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(property);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(property);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억`;
    }
    return `${price.toLocaleString()}만원`;
  };

  return (
    <div
      className={`property-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="property-card-header">
        <h3 className="property-title">
          {property.buildingName || property.address}
        </h3>
        <span className={`property-type ${property.buildingType.toLowerCase()}`}>
          {property.buildingType}
        </span>
      </div>

      <div className="property-card-body">
        <div className="property-info-row">
          <span className="property-label">주소</span>
          <span className="property-value">{property.address}</span>
        </div>

        <div className="property-info-row">
          <span className="property-label">면적</span>
          <span className="property-value">
            {property.area}m² ({Math.round(property.area * 0.3025)}평)
          </span>
        </div>

        <div className="property-info-row">
          <span className="property-label">층수</span>
          <span className="property-value">{property.floor}층</span>
        </div>

        {property.constructionYear && (
          <div className="property-info-row">
            <span className="property-label">건축년도</span>
            <span className="property-value">{property.constructionYear}년</span>
          </div>
        )}

        <div className="property-info-row">
          <span className="property-label">거래일자</span>
          <span className="property-value">{property.dealDate}</span>
        </div>
      </div>

      <div className="property-card-footer">
        <div className="property-price">{formatPrice(property.price)}</div>
        {showCompareButton && onCompare && (
          <button
            className="compare-button"
            onClick={handleCompareClick}
            aria-label="비교하기"
          >
            비교
          </button>
        )}
      </div>
    </div>
  );
}

