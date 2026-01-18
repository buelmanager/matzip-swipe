import { useState, useEffect } from 'react'
import { FiX, FiChevronRight } from 'react-icons/fi'

// 시/도 목록
const PROVINCES = [
  { id: 'all', label: '전체' },
  { id: '서울', label: '서울' },
  { id: '부산', label: '부산' },
  { id: '경기', label: '경기' },
  { id: '경북', label: '경북' },
  { id: '대전', label: '대전' },
  { id: '대구', label: '대구' },
  { id: '강원', label: '강원' },
  { id: '충남', label: '충남' },
  { id: '경남', label: '경남' },
  { id: '전주', label: '전주' },
  { id: '광주', label: '광주' },
  { id: '제주', label: '제주' },
  { id: '인천', label: '인천' },
  { id: '울산', label: '울산' },
  { id: '수원', label: '수원' },
]

// 시/도별 구/시 목록
const DISTRICTS = {
  '서울': ['전체', '강남구', '마포구', '용산구', '성동구', '종로구', '서초구', '송파구', '영등포구', '강서구', '서대문구', '동대문구', '성북구', '광진구', '동작구', '구로구', '금천구'],
  '부산': ['전체', '해운대구', '수영구', '부산진구', '동래구', '금정구', '사하구', '강서구', '남구', '서구', '동구'],
  '경기': ['전체', '성남시', '고양시', '용인시', '수원시', '김포시', '파주시', '화성시'],
  '경북': ['전체', '경주시', '포항시', '안동시', '구미시'],
  '대전': ['전체', '유성구', '서구', '중구', '동구'],
  '대구': ['전체', '수성구', '중구', '동구', '북구'],
  '강원': ['전체', '강릉시', '속초시', '춘천시', '원주시'],
  '충남': ['전체', '공주시', '천안시', '아산시'],
  '경남': ['전체', '거제시', '창원시', '진주시'],
  '전주': ['전체', '완산구', '덕진구'],
  '광주': ['전체', '동구', '서구', '남구', '북구'],
  '제주': ['전체', '제주시', '서귀포시'],
  '인천': ['전체', '중구', '연수구', '남동구'],
  '울산': ['전체', '남구', '중구', '동구'],
  '수원': ['전체', '팔달구', '영통구', '장안구'],
}

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: '한식', label: '한식' },
  { id: '양식', label: '양식' },
  { id: '일식', label: '일식' },
  { id: '중식', label: '중식' },
  { id: '카페', label: '카페' },
  { id: '고기', label: '고기/구이' },
  { id: '아시안', label: '아시안' },
  { id: '파인다이닝', label: '파인다이닝' },
  { id: '브런치', label: '브런치' },
  { id: '바', label: '바/와인' },
]

const PRICES = [
  { id: 'all', label: '전체' },
  { id: '저렴', label: '저렴' },
  { id: '보통', label: '보통' },
  { id: '고급', label: '고급' },
  { id: '럭셔리', label: '럭셔리' },
]

export default function FilterModal({ isOpen, onClose, filters, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [availableDistricts, setAvailableDistricts] = useState([])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    if (localFilters.province && localFilters.province !== 'all') {
      setAvailableDistricts(DISTRICTS[localFilters.province] || [])
    } else {
      setAvailableDistricts([])
    }
  }, [localFilters.province])

  if (!isOpen) return null

  const handleProvinceSelect = (provinceId) => {
    setLocalFilters(prev => ({
      ...prev,
      province: provinceId,
      district: 'all' // 시/도 변경 시 구/시 초기화
    }))
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    const reset = { province: 'all', district: 'all', category: 'all', price: 'all' }
    setLocalFilters(reset)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>필터</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* 시/도 선택 */}
          <div className="filter-section">
            <h3>시/도</h3>
            <div className="filter-chips">
              {PROVINCES.map(p => (
                <button
                  key={p.id}
                  className={`chip ${localFilters.province === p.id ? 'active' : ''}`}
                  onClick={() => handleProvinceSelect(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 구/시 선택 (시/도 선택 시에만 표시) */}
          {availableDistricts.length > 0 && (
            <div className="filter-section">
              <h3>구/시 <span className="sub-label">({localFilters.province})</span></h3>
              <div className="filter-chips">
                {availableDistricts.map(d => (
                  <button
                    key={d}
                    className={`chip ${localFilters.district === d || (d === '전체' && localFilters.district === 'all') ? 'active' : ''}`}
                    onClick={() => setLocalFilters(prev => ({
                      ...prev,
                      district: d === '전체' ? 'all' : d
                    }))}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 카테고리 */}
          <div className="filter-section">
            <h3>카테고리</h3>
            <div className="filter-chips">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`chip ${localFilters.category === c.id ? 'active' : ''}`}
                  onClick={() => setLocalFilters(prev => ({ ...prev, category: c.id }))}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 가격대 */}
          <div className="filter-section">
            <h3>가격대</h3>
            <div className="filter-chips">
              {PRICES.map(p => (
                <button
                  key={p.id}
                  className={`chip ${localFilters.price === p.id ? 'active' : ''}`}
                  onClick={() => setLocalFilters(prev => ({ ...prev, price: p.id }))}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleReset}>초기화</button>
          <button className="btn-primary" onClick={handleApply}>적용하기</button>
        </div>
      </div>
    </div>
  )
}
