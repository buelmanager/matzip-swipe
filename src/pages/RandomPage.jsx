import { useState, useMemo, useEffect } from 'react'
import { FiMapPin, FiStar, FiRefreshCw, FiHeart, FiNavigation, FiChevronDown, FiX, FiGlobe } from 'react-icons/fi'
import { useSaved } from '../contexts/SavedContext'
import restaurantsData from '../data/restaurants.json'
import RestaurantDetail from '../components/RestaurantDetail'
import KakaoAd from '../components/KakaoAd'
import { filterByDistance, formatDistance, findNearestLocation, getSelectableLocations } from '../utils/locationUtils'

const CATEGORIES = ['전체', '한식', '양식', '일식', '중식', '카페', '고기']
const DISTANCE_OPTIONS = [
  { value: 0, label: '전체' },
  { value: 1000, label: '1km' },
  { value: 3000, label: '3km' },
  { value: 5000, label: '5km' },
  { value: 10000, label: '10km' },
  { value: 20000, label: '20km' },
  { value: 50000, label: '50km' },
]

export default function RandomPage() {
  const { saveRestaurant, passRestaurant, isSaved } = useSaved()
  const { restaurants } = restaurantsData

  const [category, setCategory] = useState('전체')
  const [maxDistance, setMaxDistance] = useState(0)
  const [userLocation, setUserLocation] = useState(null)
  const [locationName, setLocationName] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [result, setResult] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const selectableLocations = getSelectableLocations()

  // 앱 시작 시 자동으로 현재 위치 요청
  useEffect(() => {
    if (!userLocation && !locationPermissionDenied && !isLoadingLocation) {
      requestGPSLocation(true) // true = 자동 요청 (에러 시 조용히 처리)
    }
  }, [])

  // GPS 위치 요청
  const requestGPSLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setLocationError('브라우저가 위치 정보를 지원하지 않습니다')
      return
    }

    setIsLoadingLocation(true)
    if (!silent) setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation({ lat, lng })
        const nearestName = findNearestLocation(lat, lng)
        setLocationName(nearestName ? `${nearestName} 근처` : '현재 위치')
        setMaxDistance(3000) // 기본 3km로 설정
        setIsLoadingLocation(false)
        setIsLocationModalOpen(false)
        setLocationPermissionDenied(false)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionDenied(true)
          if (!silent) setLocationError('위치 권한이 거부되었습니다. 위치를 직접 선택해주세요.')
        } else {
          if (!silent) setLocationError('위치를 가져올 수 없습니다')
        }
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // 지역 선택
  const handleSelectLocation = (location) => {
    if (location.type === 'gps') {
      requestGPSLocation(false)
    } else if (location.type === 'all') {
      // 전체 검색 (위치 초기화)
      setUserLocation(null)
      setLocationName(null)
      setMaxDistance(0)
      setLocationError(null)
      setIsLocationModalOpen(false)
    } else if (location.coords) {
      setUserLocation(location.coords)
      setLocationName(location.label)
      setLocationError(null)
      setIsLocationModalOpen(false)
      if (maxDistance === 0) {
        setMaxDistance(3000) // 지역 선택 시 기본 3km
      }
    }
  }

  // 거리 필터 선택 시 위치 없으면 모달 열기
  useEffect(() => {
    if (maxDistance > 0 && !userLocation && !isLoadingLocation) {
      setIsLocationModalOpen(true)
    }
  }, [maxDistance])

  const filteredList = useMemo(() => {
    let list = restaurants

    // 카테고리 필터
    if (category !== '전체') {
      list = list.filter(r => r.category?.includes(category))
    }

    // 거리 필터
    if (maxDistance > 0 && userLocation) {
      list = filterByDistance(list, userLocation.lat, userLocation.lng, maxDistance)
    }

    return list
  }, [restaurants, category, maxDistance, userLocation])

  const spin = () => {
    if (filteredList.length === 0) return

    setIsSpinning(true)
    setResult(null)

    let count = 0
    const maxCount = 15
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * filteredList.length)
      setResult(filteredList[randomIdx])
      count++

      if (count >= maxCount) {
        clearInterval(interval)
        setIsSpinning(false)
        const finalIdx = Math.floor(Math.random() * filteredList.length)
        setResult(filteredList[finalIdx])
      }
    }, 100)
  }

  const handleSave = () => {
    if (result) {
      saveRestaurant(result.id)
    }
  }

  const clearLocation = () => {
    setUserLocation(null)
    setLocationName(null)
    setMaxDistance(0)
  }

  return (
    <div className="page random-page">
      <header className="page-header">
        <h1>오늘 뭐 먹지?</h1>
        <p>랜덤으로 맛집을 추천받아보세요</p>
      </header>

      <div className="random-content">
        {/* 카테고리 선택 */}
        <div className="category-selector">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 위치 선택 */}
        <div className="location-selector">
          <div className="location-header">
            <FiNavigation />
            <span>내 위치</span>
            {isLoadingLocation && <span className="loading-indicator">확인 중...</span>}
          </div>

          <button
            className="location-select-btn"
            onClick={() => setIsLocationModalOpen(true)}
          >
            {userLocation ? <FiMapPin /> : <FiGlobe />}
            <span>{locationName || '전체 검색'}</span>
            <FiChevronDown />
          </button>

          {locationPermissionDenied && !userLocation && (
            <p className="location-hint">위치 권한이 거부되어 전체 검색 중입니다. 위치를 선택하세요.</p>
          )}
        </div>

        {/* 거리 필터 - 위치 선택 시만 표시 */}
        {userLocation && (
          <div className="distance-filter">
            <div className="distance-header">
              <span>검색 반경</span>
              <span className="filter-count">{filteredList.length}개 맛집</span>
            </div>
            <div className="distance-options">
              {DISTANCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`distance-chip ${maxDistance === opt.value ? 'active' : ''}`}
                  onClick={() => setMaxDistance(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 결과 카드 또는 플레이스홀더 */}
        <div className={`random-card-area ${isSpinning ? 'spinning' : ''}`}>
          {result ? (
            <div className="random-result-card" onClick={() => setSelectedRestaurant(result)}>
              <div className="result-image">
                <img src={result.imageUrl} alt={result.name} />
                <span className="result-category">{result.category}</span>
                {result.distance && (
                  <span className="result-distance">{formatDistance(result.distance)}</span>
                )}
              </div>
              <div className="result-info">
                <h2>{result.name}</h2>
                <div className="result-meta">
                  <span className="rating">
                    <FiStar /> {result.rating}
                  </span>
                  <span className="location">
                    <FiMapPin /> {result.neighborhood}
                  </span>
                  <span className="price">{result.priceRange}</span>
                </div>
                {result.signature && (
                  <p className="signature">시그니처: {result.signature}</p>
                )}
                <p className="description">{result.description}</p>
              </div>
              {!isSaved(result.id) && (
                <button className="save-btn" onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                  <FiHeart /> 저장하기
                </button>
              )}
              {isSaved(result.id) && (
                <div className="already-saved">
                  <FiHeart /> 저장됨
                </div>
              )}
            </div>
          ) : (
            <div className="random-placeholder">
              <span className="placeholder-icon">🎰</span>
              <p>버튼을 눌러 맛집을 뽑아보세요!</p>
            </div>
          )}
        </div>

        {/* 스핀 버튼 */}
        <button
          className={`spin-btn ${isSpinning ? 'spinning' : ''}`}
          onClick={spin}
          disabled={isSpinning || filteredList.length === 0}
        >
          <FiRefreshCw />
          <span>
            {isSpinning ? '뽑는 중...' :
             filteredList.length === 0 ? '조건에 맞는 맛집이 없어요' :
             '랜덤 맛집 뽑기'}
          </span>
        </button>

        {/* 광고 */}
        <div className="ad-section">
          <KakaoAd />
        </div>
      </div>

      {/* 위치 선택 모달 */}
      {isLocationModalOpen && (
        <div className="location-modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
          <div className="location-modal" onClick={e => e.stopPropagation()}>
            <div className="location-modal-header">
              <h3>위치 선택</h3>
              <button className="modal-close" onClick={() => setIsLocationModalOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="location-modal-content">
              {locationError && (
                <p className="location-error">{locationError}</p>
              )}

              {selectableLocations.map(loc => {
                if (loc.type === 'separator') {
                  return (
                    <div key={loc.id} className="location-separator">
                      {loc.label}
                    </div>
                  )
                }

                return (
                  <button
                    key={loc.id}
                    className={`location-option ${loc.type === 'gps' ? 'gps' : ''} ${loc.type === 'all' ? 'all' : ''}`}
                    onClick={() => handleSelectLocation(loc)}
                    disabled={loc.type === 'gps' && isLoadingLocation}
                  >
                    {loc.type === 'gps' ? (
                      <>
                        <FiNavigation />
                        <span>{isLoadingLocation ? '위치 확인 중...' : loc.label}</span>
                      </>
                    ) : loc.type === 'all' ? (
                      <>
                        <FiGlobe />
                        <span>{loc.label}</span>
                      </>
                    ) : (
                      <>
                        <FiMapPin />
                        <span>{loc.label}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <RestaurantDetail
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onPass={() => {
          if (selectedRestaurant) passRestaurant(selectedRestaurant.id)
          setSelectedRestaurant(null)
        }}
        onSave={() => {
          if (selectedRestaurant) saveRestaurant(selectedRestaurant.id)
          setSelectedRestaurant(null)
        }}
      />
    </div>
  )
}
