import { useState, useMemo } from 'react'
import { FiMapPin, FiStar, FiTrash2, FiHeart } from 'react-icons/fi'
import { useSaved } from '../contexts/SavedContext'
import restaurantsData from '../data/restaurants.json'
import RestaurantDetail from '../components/RestaurantDetail'
import KakaoAd from '../components/KakaoAd'

export default function SavedPage() {
  const { saved, removeFromSaved, saveRestaurant, passRestaurant } = useSaved()
  const { restaurants } = restaurantsData
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const savedRestaurants = useMemo(() => {
    return restaurants.filter(r => saved.includes(r.id))
  }, [restaurants, saved])

  if (savedRestaurants.length === 0) {
    return (
      <div className="page saved-page">
        <header className="page-header">
          <h1>저장한 맛집</h1>
        </header>
        <div className="empty-state">
          <FiHeart className="empty-icon" />
          <h3>아직 저장한 맛집이 없어요</h3>
          <p>탐색에서 오른쪽으로 스와이프해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page saved-page">
      <header className="page-header">
        <h1>저장한 맛집</h1>
        <span className="count">{savedRestaurants.length}곳</span>
      </header>

      <div className="saved-grid">
        {savedRestaurants.map(restaurant => (
          <div
            key={restaurant.id}
            className="saved-card"
            onClick={() => setSelectedRestaurant(restaurant)}
          >
            <div className="saved-image">
              <img src={restaurant.imageUrl} alt={restaurant.name} />
              <span className="saved-category">{restaurant.category}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromSaved(restaurant.id)
                }}
              >
                <FiTrash2 />
              </button>
            </div>
            <div className="saved-info">
              <h3>{restaurant.name}</h3>
              <div className="saved-meta">
                <span className="rating">
                  <FiStar /> {restaurant.rating}
                </span>
                <span className="location">
                  <FiMapPin /> {restaurant.neighborhood}
                </span>
              </div>
              <span className="price">{restaurant.priceRange}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 광고 */}
      <div className="ad-section">
        <KakaoAd />
      </div>

      <RestaurantDetail
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onPass={() => {
          if (selectedRestaurant) {
            removeFromSaved(selectedRestaurant.id)
            passRestaurant(selectedRestaurant.id)
          }
          setSelectedRestaurant(null)
        }}
        onSave={() => {
          setSelectedRestaurant(null)
        }}
      />
    </div>
  )
}
