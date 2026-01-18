import { FiX, FiHeart, FiMapPin, FiStar, FiExternalLink } from 'react-icons/fi'
import { useSaved } from '../contexts/SavedContext'

export default function RestaurantDetail({ restaurant, isOpen, onClose, onPass, onSave }) {
  const { isSaved } = useSaved()

  if (!isOpen || !restaurant) return null

  const formatPrice = (price) => {
    if (!price) return null
    return price.toLocaleString() + '원'
  }

  const openKakaoMap = () => {
    const query = encodeURIComponent(restaurant.address || restaurant.name)
    window.open(`https://map.kakao.com/link/search/${query}`, '_blank')
  }

  const openNaverMap = () => {
    const query = encodeURIComponent(restaurant.address || restaurant.name)
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank')
  }

  const openYoutubeSearch = () => {
    const query = encodeURIComponent(restaurant.name + ' 맛집')
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
  }

  const openNaverSearch = () => {
    const query = encodeURIComponent(restaurant.name + ' 맛집')
    window.open(`https://search.naver.com/search.naver?query=${query}`, '_blank')
  }

  const handlePass = () => {
    onPass()
    onClose()
  }

  const handleSave = () => {
    onSave()
    onClose()
  }

  const saved = isSaved(restaurant.id)

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 이미지 */}
        <div className="detail-image">
          <img src={restaurant.imageUrl} alt={restaurant.name} />
          <button className="detail-close" onClick={onClose}>
            <FiX />
          </button>
          <button
            className={`detail-heart ${saved ? 'active' : ''}`}
            onClick={handleSave}
          >
            <FiHeart />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="detail-content">
          {/* 기본 정보 */}
          <div className="detail-header">
            <span className="detail-category">{restaurant.category}</span>
            <h1 className="detail-name">{restaurant.name}</h1>
            <div className="detail-meta">
              <span className="detail-rating">
                <FiStar /> {restaurant.rating}
              </span>
              <span className="detail-divider">·</span>
              <span className="detail-price-range">{restaurant.priceRange}</span>
            </div>
          </div>

          {/* 위치 */}
          <div className="detail-section">
            <div className="detail-address">
              <FiMapPin />
              <span>{restaurant.address}</span>
            </div>
            <div className="detail-map-buttons">
              <button onClick={openKakaoMap}>
                카카오맵 <FiExternalLink />
              </button>
              <button onClick={openNaverMap}>
                네이버지도 <FiExternalLink />
              </button>
            </div>
          </div>

          {/* 시그니처 & 가격 */}
          <div className="detail-section detail-info-grid">
            {restaurant.signature && (
              <div className="detail-info-item">
                <span className="info-label">시그니처</span>
                <span className="info-value">{restaurant.signature}</span>
              </div>
            )}
            {restaurant.avgPrice && (
              <div className="detail-info-item">
                <span className="info-label">평균 가격</span>
                <span className="info-value">{formatPrice(restaurant.avgPrice)}</span>
              </div>
            )}
          </div>

          {/* 설명 */}
          {restaurant.description && (
            <div className="detail-section">
              <p className="detail-description">{restaurant.description}</p>
            </div>
          )}

          {/* 꿀팁 */}
          {restaurant.tip && (
            <div className="detail-section detail-tip">
              <span className="tip-label">꿀팁</span>
              <p>{restaurant.tip}</p>
            </div>
          )}

          {/* 분위기 태그 */}
          {restaurant.mood && restaurant.mood.length > 0 && (
            <div className="detail-section">
              <div className="detail-tags">
                {restaurant.mood.map((tag, idx) => (
                  <span key={idx} className="detail-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* 더 찾아보기 (유튜브/네이버 검색) */}
          <div className="detail-section detail-external-search">
            <span className="external-search-title">더 찾아보기</span>
            <div className="detail-search-buttons">
              <button className="detail-search-btn youtube" onClick={openYoutubeSearch}>
                <span className="search-icon">▶</span>
                YouTube에서 검색
                <FiExternalLink />
              </button>
              <button className="detail-search-btn naver" onClick={openNaverSearch}>
                <span className="search-icon">N</span>
                네이버에서 검색
                <FiExternalLink />
              </button>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="detail-actions">
          <button className="detail-btn pass" onClick={handlePass}>
            <FiX />
            <span>패스</span>
          </button>
          <button
            className={`detail-btn save ${saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <FiHeart />
            <span>{saved ? '저장됨' : '저장하기'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
