import { useState, useRef, useEffect } from 'react'
import { FiSend, FiMapPin, FiStar, FiHeart, FiExternalLink } from 'react-icons/fi'
import { searchRestaurants, describeConditions } from '../utils/chatSearch'
import { useSaved } from '../contexts/SavedContext'
import restaurantsData from '../data/restaurants.json'
import RestaurantDetail from './RestaurantDetail'

// 외부 검색 링크 생성
const getExternalSearchLinks = (query) => ({
  youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' 맛집')}`,
  naver: `https://search.naver.com/search.naver?query=${encodeURIComponent(query + ' 맛집')}`
})

const INITIAL_MESSAGE = {
  type: 'bot',
  text: '안녕하세요! 어떤 맛집을 찾고 계세요?\n\n예시:\n"강남에서 데이트하기 좋은 이탈리안"\n"성수동 브런치 카페"\n"가성비 좋은 한식"'
}

const SUGGESTIONS = [
  '강남 데이트',
  '성수동 카페',
  '홍대 맛집',
  '가성비 한식',
  '분위기 좋은 이탈리안'
]

export default function ChatBot() {
  const { restaurants } = restaurantsData
  const { saveRestaurant, isSaved } = useSaved()
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { type: 'user', text: input }
    setMessages(prev => [...prev, userMessage])

    // 검색 수행
    const { results, conditions } = searchRestaurants(restaurants, input)
    const searchQuery = input.trim()

    let botResponse
    if (results.length === 0) {
      botResponse = {
        type: 'bot',
        text: '조건에 맞는 맛집을 찾지 못했어요.\n다른 키워드로 검색해보세요!',
        searchQuery // 외부 검색을 위해 쿼리 저장
      }
    } else {
      const conditionDesc = describeConditions(conditions)
      botResponse = {
        type: 'bot',
        text: `${conditionDesc ? `[${conditionDesc}]\n` : ''}${results.length}개의 맛집을 찾았어요!`,
        results,
        searchQuery // 외부 검색을 위해 쿼리 저장
      }
    }

    setMessages(prev => [...prev, botResponse])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
  }

  const handleCardClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleSave = (id) => {
    saveRestaurant(id)
  }

  return (
    <div className="chatbot">
      {/* 메시지 영역 */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.type}`}>
            {msg.type === 'bot' && (
              <div className="bot-avatar">AI</div>
            )}
            <div className="message-content">
              <p className="message-text">{msg.text}</p>
              {msg.results && (
                <div className="result-cards">
                  {msg.results.map(restaurant => (
                    <div
                      key={restaurant.id}
                      className="chat-result-card"
                      onClick={() => handleCardClick(restaurant)}
                    >
                      <div className="result-card-image">
                        <img src={restaurant.imageUrl} alt={restaurant.name} />
                      </div>
                      <div className="result-card-info">
                        <span className="result-card-category">{restaurant.category}</span>
                        <h4 className="result-card-name">{restaurant.name}</h4>
                        <div className="result-card-meta">
                          <span><FiStar /> {restaurant.rating}</span>
                          <span><FiMapPin /> {restaurant.neighborhood}</span>
                          <span>{restaurant.priceRange}</span>
                        </div>
                      </div>
                      <button
                        className={`result-card-save ${isSaved(restaurant.id) ? 'saved' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSave(restaurant.id)
                        }}
                      >
                        <FiHeart />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* 외부 검색 버튼 */}
              {msg.searchQuery && (
                <div className="external-search-links">
                  <span className="external-search-label">더 찾아보기</span>
                  <div className="external-search-buttons">
                    <a
                      href={getExternalSearchLinks(msg.searchQuery).youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-search-btn youtube"
                    >
                      <span className="external-icon">▶</span>
                      YouTube
                      <FiExternalLink />
                    </a>
                    <a
                      href={getExternalSearchLinks(msg.searchQuery).naver}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-search-btn naver"
                    >
                      <span className="external-icon">N</span>
                      네이버
                      <FiExternalLink />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 추천 검색어 */}
      {messages.length === 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              className="suggestion-chip"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="어떤 맛집을 찾으세요?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
          <FiSend />
        </button>
      </div>

      {/* 상세 모달 */}
      <RestaurantDetail
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onPass={() => setSelectedRestaurant(null)}
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
