import { useState, useRef } from 'react'
import { FiMapPin, FiStar, FiX, FiHeart } from 'react-icons/fi'

export default function SwipeCard({ restaurant, onSwipeLeft, onSwipeRight, onTap, isTop }) {
  const cardRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)

  const handleStart = (clientX, clientY) => {
    if (!isTop) return
    setIsDragging(true)
    setHasMoved(false)
    setStartPos({ x: clientX, y: clientY })
  }

  const handleMove = (clientX, clientY) => {
    if (!isDragging || !isTop) return
    const deltaX = clientX - startPos.x
    const deltaY = clientY - startPos.y

    // 움직임이 10px 이상이면 드래그로 간주
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setHasMoved(true)
    }

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleEnd = () => {
    if (!isDragging || !isTop) return
    setIsDragging(false)

    const threshold = 100

    // 스와이프 감지
    if (position.x > threshold) {
      onSwipeRight()
    } else if (position.x < -threshold) {
      onSwipeLeft()
    } else if (!hasMoved && onTap) {
      // 움직이지 않았으면 탭으로 간주
      onTap()
    }

    setPosition({ x: 0, y: 0 })
    setHasMoved(false)
  }

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY)
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY)
  const handleMouseUp = () => handleEnd()
  const handleMouseLeave = () => {
    if (isDragging) handleEnd()
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }
  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }
  const handleTouchEnd = () => handleEnd()

  const rotation = position.x * 0.1
  const opacity = Math.min(Math.abs(position.x) / 100, 1)

  const cardStyle = {
    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease',
    cursor: isTop ? 'grab' : 'default',
    zIndex: isTop ? 10 : 1,
  }

  return (
    <div
      ref={cardRef}
      className={`swipe-card ${isDragging ? 'dragging' : ''}`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 스와이프 인디케이터 */}
      <div className="swipe-indicator like" style={{ opacity: position.x > 0 ? opacity : 0 }}>
        <FiHeart />
        <span>SAVE</span>
      </div>
      <div className="swipe-indicator nope" style={{ opacity: position.x < 0 ? opacity : 0 }}>
        <FiX />
        <span>PASS</span>
      </div>

      {/* 카드 이미지 */}
      <div className="card-image">
        <img src={restaurant.imageUrl} alt={restaurant.name} />
        <div className="card-gradient"></div>
        {/* 탭 힌트 */}
        <div className="tap-hint">탭하여 상세보기</div>
      </div>

      {/* 카드 정보 */}
      <div className="card-info">
        <div className="card-category">{restaurant.category}</div>
        <h2 className="card-name">{restaurant.name}</h2>

        <div className="card-meta">
          <div className="card-rating">
            <FiStar />
            <span>{restaurant.rating}</span>
          </div>
          <div className="card-location">
            <FiMapPin />
            <span>{restaurant.neighborhood}</span>
          </div>
          <div className="card-price">{restaurant.priceRange}</div>
        </div>

        {restaurant.signature && (
          <p className="card-signature">"{restaurant.signature}"</p>
        )}

        <div className="card-tags">
          {restaurant.mood?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="tag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
