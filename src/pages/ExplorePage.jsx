import { useState, useMemo } from 'react'
import { FiSliders } from 'react-icons/fi'
import CardStack from '../components/CardStack'
import FilterModal from '../components/FilterModal'
import RestaurantDetail from '../components/RestaurantDetail'
import { useSaved } from '../contexts/SavedContext'
import restaurantsData from '../data/restaurants.json'

export default function ExplorePage() {
  const { saveRestaurant, passRestaurant } = useSaved()
  const [filters, setFilters] = useState({
    province: 'all',
    district: 'all',
    category: 'all',
    price: 'all'
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const { restaurants } = restaurantsData

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants]

    // 시/도 필터
    if (filters.province !== 'all') {
      result = result.filter(r => r.region === filters.province)
    }

    // 구/시 필터
    if (filters.district !== 'all') {
      result = result.filter(r => r.district === filters.district)
    }

    // 카테고리 필터
    if (filters.category !== 'all') {
      result = result.filter(r =>
        r.category?.includes(filters.category)
      )
    }

    // 가격 필터
    if (filters.price !== 'all') {
      result = result.filter(r => r.priceRange === filters.price)
    }

    // 랜덤 셔플
    return result.sort(() => Math.random() - 0.5)
  }, [restaurants, filters])

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length

  // 현재 선택된 지역 표시
  const getLocationLabel = () => {
    if (filters.province === 'all') return '전국'
    if (filters.district === 'all') return filters.province
    return `${filters.province} ${filters.district}`
  }

  // 카드 탭 시 상세화면 열기
  const handleCardTap = (restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  // 상세화면에서 패스
  const handleDetailPass = () => {
    if (selectedRestaurant) {
      passRestaurant(selectedRestaurant.id)
    }
  }

  // 상세화면에서 저장
  const handleDetailSave = () => {
    if (selectedRestaurant) {
      saveRestaurant(selectedRestaurant.id)
    }
  }

  return (
    <div className="page explore-page">
      <header className="explore-header">
        <div className="header-content">
          <h1>맛집 탐험</h1>
          <p>{getLocationLabel()} · {filteredRestaurants.length}개 맛집</p>
        </div>
        <button
          className={`filter-btn ${activeFilterCount > 0 ? 'has-filter' : ''}`}
          onClick={() => setIsFilterOpen(true)}
        >
          <FiSliders />
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
      </header>

      <div className="explore-content">
        <CardStack
          key={JSON.stringify(filters)}
          restaurants={filteredRestaurants}
          onCardTap={handleCardTap}
        />
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      <RestaurantDetail
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onPass={handleDetailPass}
        onSave={handleDetailSave}
      />
    </div>
  )
}
