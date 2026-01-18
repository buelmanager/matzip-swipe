import { useState, useMemo } from 'react'
import { FiRefreshCw, FiHeart, FiX, FiInfo, FiChevronRight, FiMapPin, FiStar, FiArrowLeft } from 'react-icons/fi'
import { useSaved } from '../contexts/SavedContext'
import restaurantsData from '../data/restaurants.json'
import RestaurantDetail from '../components/RestaurantDetail'

export default function MyPage() {
  const { saved, passed, savedCount, passedCount, resetAll, saveRestaurant, passRestaurant, removeFromSaved } = useSaved()
  const { restaurants } = restaurantsData

  const [viewMode, setViewMode] = useState(null) // null, 'saved', 'passed'
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const savedRestaurants = useMemo(() => {
    return restaurants.filter(r => saved.includes(r.id))
  }, [restaurants, saved])

  const passedRestaurants = useMemo(() => {
    return restaurants.filter(r => passed.includes(r.id))
  }, [restaurants, passed])

  const handleReset = () => {
    if (window.confirm('모든 저장 및 패스 기록을 초기화할까요?')) {
      resetAll()
    }
  }

  // 리스트 뷰 모드
  if (viewMode) {
    const listData = viewMode === 'saved' ? savedRestaurants : passedRestaurants
    const title = viewMode === 'saved' ? '저장한 맛집' : '패스한 맛집'

    return (
      <div className="page my-page">
        <header className="page-header list-header">
          <button className="back-btn" onClick={() => setViewMode(null)}>
            <FiArrowLeft />
          </button>
          <h1>{title}</h1>
          <span className="count">{listData.length}곳</span>
        </header>

        {listData.length === 0 ? (
          <div className="empty-state">
            {viewMode === 'saved' ? <FiHeart className="empty-icon" /> : <FiX className="empty-icon" />}
            <h3>{viewMode === 'saved' ? '저장한 맛집이 없어요' : '패스한 맛집이 없어요'}</h3>
          </div>
        ) : (
          <div className="my-list">
            {listData.map(restaurant => (
              <div
                key={restaurant.id}
                className="my-list-item"
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <div className="list-item-image">
                  <img src={restaurant.imageUrl} alt={restaurant.name} />
                </div>
                <div className="list-item-info">
                  <span className="list-item-category">{restaurant.category}</span>
                  <h3>{restaurant.name}</h3>
                  <div className="list-item-meta">
                    <span><FiStar /> {restaurant.rating}</span>
                    <span><FiMapPin /> {restaurant.neighborhood}</span>
                    <span>{restaurant.priceRange}</span>
                  </div>
                </div>
                <FiChevronRight className="list-item-arrow" />
              </div>
            ))}
          </div>
        )}

        <RestaurantDetail
          restaurant={selectedRestaurant}
          isOpen={!!selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onPass={() => {
            if (selectedRestaurant) {
              if (viewMode === 'saved') removeFromSaved(selectedRestaurant.id)
              passRestaurant(selectedRestaurant.id)
            }
            setSelectedRestaurant(null)
          }}
          onSave={() => {
            if (selectedRestaurant) {
              saveRestaurant(selectedRestaurant.id)
            }
            setSelectedRestaurant(null)
          }}
        />
      </div>
    )
  }

  // 메인 마이페이지
  return (
    <div className="page my-page">
      <header className="page-header">
        <h1>마이페이지</h1>
      </header>

      <div className="my-content">
        {/* 통계 카드 - 클릭 가능 */}
        <div className="stats-card">
          <div className="stat-item clickable" onClick={() => setViewMode('saved')}>
            <div className="stat-icon saved">
              <FiHeart />
            </div>
            <div className="stat-info">
              <span className="stat-value">{savedCount}</span>
              <span className="stat-label">저장한 맛집</span>
            </div>
            <FiChevronRight className="stat-arrow" />
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item clickable" onClick={() => setViewMode('passed')}>
            <div className="stat-icon passed">
              <FiX />
            </div>
            <div className="stat-info">
              <span className="stat-value">{passedCount}</span>
              <span className="stat-label">패스한 맛집</span>
            </div>
            <FiChevronRight className="stat-arrow" />
          </div>
        </div>

        {/* 메뉴 */}
        <div className="menu-section">
          <button className="menu-item" onClick={handleReset}>
            <FiRefreshCw />
            <span>기록 초기화</span>
          </button>
        </div>

        {/* 앱 정보 */}
        <div className="app-info">
          <FiInfo />
          <div className="info-text">
            <h3>맛집 탐험</h3>
            <p>500개의 엄선된 맛집을 탐색해보세요</p>
            <span className="version">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
