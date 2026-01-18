// 키워드 기반 맛집 검색 유틸리티

// 지역 관련 키워드
const REGION_KEYWORDS = [
  '서울', '부산', '경기', '인천', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]

// 구/동 키워드 (자주 검색되는 것들)
const DISTRICT_KEYWORDS = [
  '강남', '홍대', '이태원', '성수', '을지로', '연남', '망원', '합정',
  '압구정', '청담', '신사', '삼청동', '북촌', '익선동', '해운대',
  '서면', '광안리', '전주', '경주', '강릉', '여수', '제주시', '서귀포'
]

// 카테고리 키워드
const CATEGORY_KEYWORDS = {
  '한식': ['한식', '한정식', '국밥', '찌개', '비빔밥', '냉면'],
  '양식': ['양식', '이탈리안', '파스타', '피자', '스테이크', '프렌치'],
  '일식': ['일식', '스시', '초밥', '라멘', '오마카세', '이자카야', '일본'],
  '중식': ['중식', '중국집', '짜장', '짬뽕', '딤섬', '훠궈'],
  '고기': ['고기', '삼겹살', '갈비', '소고기', '돼지고기', 'bbq', '구이'],
  '카페': ['카페', '커피', '디저트', '케이크', '베이커리', '빵'],
  '아시안': ['아시안', '태국', '베트남', '쌀국수', '팟타이', '인도'],
  '파인다이닝': ['파인다이닝', '고급', '코스', '미슐랭'],
  '브런치': ['브런치', '아침', '모닝'],
  '술집': ['술집', '바', '이자카야', '와인바', '펍']
}

// 분위기 키워드
const MOOD_KEYWORDS = [
  '로맨틱', '캐주얼', '힙한', '고급', '가성비', '분위기좋은', '핫플', '노포',
  '데이트', '혼밥', '단체', '비즈니스', '가족', '친구', '특별한날', '조용한'
]

// 가격대 키워드
const PRICE_KEYWORDS = {
  '저렴': ['저렴', '싼', '가성비', '착한'],
  '보통': ['보통', '적당'],
  '고급': ['고급', '비싼', '럭셔리'],
  '럭셔리': ['럭셔리', '프리미엄', '최고급']
}

/**
 * 사용자 쿼리를 파싱하여 검색 조건 추출
 */
export function parseQuery(query) {
  const lowerQuery = query.toLowerCase()
  const tokens = query.split(/[\s,]+/).filter(t => t.length > 0)

  const conditions = {
    regions: [],
    districts: [],
    categories: [],
    moods: [],
    priceRanges: [],
    keywords: []
  }

  // 지역 매칭
  REGION_KEYWORDS.forEach(region => {
    if (query.includes(region)) {
      conditions.regions.push(region)
    }
  })

  // 구/동 매칭
  DISTRICT_KEYWORDS.forEach(district => {
    if (query.includes(district)) {
      conditions.districts.push(district)
    }
  })

  // 카테고리 매칭
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        if (!conditions.categories.includes(category)) {
          conditions.categories.push(category)
        }
      }
    })
  })

  // 분위기 매칭
  MOOD_KEYWORDS.forEach(mood => {
    if (query.includes(mood)) {
      conditions.moods.push(mood)
    }
  })

  // 가격대 매칭
  Object.entries(PRICE_KEYWORDS).forEach(([priceRange, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        if (!conditions.priceRanges.includes(priceRange)) {
          conditions.priceRanges.push(priceRange)
        }
      }
    })
  })

  // 나머지 토큰은 일반 키워드로
  tokens.forEach(token => {
    if (token.length >= 2) {
      const isMatched =
        conditions.regions.some(r => token.includes(r)) ||
        conditions.districts.some(d => token.includes(d)) ||
        conditions.moods.some(m => token.includes(m))

      if (!isMatched) {
        conditions.keywords.push(token)
      }
    }
  })

  return conditions
}

/**
 * 레스토랑이 조건에 얼마나 매칭되는지 점수 계산
 */
function calculateScore(restaurant, conditions) {
  let score = 0

  // 지역 매칭 (가중치 높음)
  conditions.regions.forEach(region => {
    if (restaurant.region === region) score += 10
  })

  // 구/동 매칭
  conditions.districts.forEach(district => {
    if (restaurant.district?.includes(district)) score += 8
    if (restaurant.neighborhood?.includes(district)) score += 8
  })

  // 카테고리 매칭
  conditions.categories.forEach(category => {
    if (restaurant.category?.includes(category)) score += 7
  })

  // 분위기 매칭
  conditions.moods.forEach(mood => {
    if (restaurant.mood?.some(m => m.includes(mood) || mood.includes(m))) {
      score += 5
    }
  })

  // 가격대 매칭
  conditions.priceRanges.forEach(priceRange => {
    if (restaurant.priceRange === priceRange) score += 4
  })

  // 일반 키워드 매칭 (이름, 설명, 시그니처에서)
  conditions.keywords.forEach(keyword => {
    const searchText = `${restaurant.name} ${restaurant.description || ''} ${restaurant.signature || ''}`.toLowerCase()
    if (searchText.includes(keyword.toLowerCase())) {
      score += 3
    }
  })

  return score
}

/**
 * 조건에 맞는 레스토랑 검색
 */
export function searchRestaurants(restaurants, query) {
  if (!query || query.trim().length < 2) {
    return { results: [], conditions: null }
  }

  const conditions = parseQuery(query)

  // 모든 조건이 비어있으면 검색 불가
  const hasConditions =
    conditions.regions.length > 0 ||
    conditions.districts.length > 0 ||
    conditions.categories.length > 0 ||
    conditions.moods.length > 0 ||
    conditions.priceRanges.length > 0 ||
    conditions.keywords.length > 0

  if (!hasConditions) {
    return { results: [], conditions }
  }

  // 점수 계산 및 정렬
  const scored = restaurants.map(r => ({
    ...r,
    score: calculateScore(r, conditions)
  }))

  // 점수가 0보다 큰 것만 필터링하고 정렬
  const results = scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // 상위 10개만

  return { results, conditions }
}

/**
 * 검색 조건을 자연어로 설명
 */
export function describeConditions(conditions) {
  const parts = []

  if (conditions.regions.length > 0) {
    parts.push(conditions.regions.join(', '))
  }
  if (conditions.districts.length > 0) {
    parts.push(conditions.districts.join(', '))
  }
  if (conditions.categories.length > 0) {
    parts.push(conditions.categories.join(', '))
  }
  if (conditions.moods.length > 0) {
    parts.push(conditions.moods.map(m => `#${m}`).join(' '))
  }
  if (conditions.priceRanges.length > 0) {
    parts.push(conditions.priceRanges.join(', ') + ' 가격대')
  }

  return parts.join(' / ')
}
