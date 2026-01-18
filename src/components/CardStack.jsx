import { useState, useEffect } from 'react'
import { FiX, FiHeart } from 'react-icons/fi'
import SwipeCard from './SwipeCard'
import { useSaved } from '../contexts/SavedContext'

export default function CardStack({ restaurants, onEmpty, onCardTap }) {
  const { saveRestaurant, passRestaurant } = useSaved()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState([])

  useEffect(() => {
    // 모든 맛집을 그대로 사용 (패스/저장 기록과 무관하게)
    setCards([...restaurants])
    setCurrentIndex(0)
  }, [restaurants])

  const handleSwipeLeft = () => {
    if (cards[currentIndex]) {
      passRestaurant(cards[currentIndex].id)
    }
    goNext()
  }

  const handleSwipeRight = () => {
    if (cards[currentIndex]) {
      saveRestaurant(cards[currentIndex].id)
    }
    goNext()
  }

  const handleTap = () => {
    if (cards[currentIndex] && onCardTap) {
      onCardTap(cards[currentIndex])
    }
  }

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (onEmpty) {
      onEmpty()
    }
  }

  // 외부에서 호출할 수 있도록 현재 카드 정보 제공
  const getCurrentCard = () => cards[currentIndex]

  const visibleCards = cards.slice(currentIndex, currentIndex + 3)

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="card-stack-empty">
        <div className="empty-icon">🍽️</div>
        <h3>모든 맛집을 확인했어요!</h3>
        <p>필터를 바꾸거나 다시 시작해보세요</p>
      </div>
    )
  }

  return (
    <div className="card-stack">
      {visibleCards.map((restaurant, idx) => (
        <div
          key={restaurant.id}
          className="card-wrapper"
          style={{
            zIndex: 3 - idx,
            transform: `scale(${1 - idx * 0.05}) translateY(${idx * 10}px)`,
            opacity: idx === 0 ? 1 : 0.7,
          }}
        >
          <SwipeCard
            restaurant={restaurant}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onTap={idx === 0 ? handleTap : undefined}
            isTop={idx === 0}
          />
        </div>
      ))}

      {/* 하단 버튼 */}
      <div className="card-actions">
        <button className="action-btn pass" onClick={handleSwipeLeft}>
          <FiX />
        </button>
        <button className="action-btn save" onClick={handleSwipeRight}>
          <FiHeart />
        </button>
      </div>

      <div className="card-counter">
        {currentIndex + 1} / {cards.length}
      </div>
    </div>
  )
}
