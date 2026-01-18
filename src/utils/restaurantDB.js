// 맛집 DB 필터링 및 매칭 유틸리티
import restaurantsData from '../data/restaurants.json';

const { restaurants } = restaurantsData;

// 지역 매핑 (SearchForm 지역 → DB 지역/구/동네)
const REGION_MAPPING = {
  '서울 강남/역삼': { region: '서울', districts: ['강남구'], neighborhoods: ['강남', '역삼', '청담동', '강남역'] },
  '서울 홍대/합정': { region: '서울', districts: ['마포구'], neighborhoods: ['홍대', '합정', '연남동', '망원동'] },
  '서울 이태원/한남': { region: '서울', districts: ['용산구'], neighborhoods: ['이태원', '한남동', '경리단길', '삼각지', '신용산'] },
  '서울 성수/건대': { region: '서울', districts: ['성동구', '광진구'], neighborhoods: ['성수동', '건대', '뚝섬'] },
  '서울 여의도/영등포': { region: '서울', districts: ['영등포구', '구로구', '금천구'], neighborhoods: ['여의도', '영등포', '문래동', '신도림', '구로', '금천', '대림', '가산'] },
  '서울 종로/광화문': { region: '서울', districts: ['종로구', '중구'], neighborhoods: ['익선동', '북촌', '삼청동', '안국', '광화문', '시청', '을지로', '명동', '종로3가', '충무로'] },
  '서울 잠실/송파': { region: '서울', districts: ['송파구'], neighborhoods: ['잠실', '송리단길', '석촌호수'] },
  '경기 판교/분당': { region: '경기', districts: ['성남시', '수원시'], neighborhoods: ['판교', '분당', '수지', '광교', '행리단길', '인계동'] },
  '부산 해운대': { region: '부산', districts: ['해운대구', '수영구'], neighborhoods: ['해운대', '광안리', '마린시티', '센텀시티'] },
  '부산 서면': { region: '부산', districts: ['부산진구', '동래구', '영도구'], neighborhoods: ['서면', '전포카페거리', '동래', '영도'] },
  '제주도': { region: '제주', districts: ['제주시', '서귀포시'], neighborhoods: ['제주', '서귀포', '성산', '한경면'] }
};

// 분위기 매핑 (SearchForm mood → DB mood)
const MOOD_MAPPING = {
  romantic: ['로맨틱', '데이트', '분위기좋은', '뷰맛집', '야경', '특별한날'],
  active: ['핫플', '힙한', '체험', '등산', '서핑'],
  chill: ['힐링', '카공', '한적한', '자연', '휴식', '산책'],
  foodie: ['맛집', '가성비', '로컬', '노포', '시장'],
  culture: ['전통', '한옥', '역사', '유네스코', '갤러리', '문화'],
  night: ['야경', '바', '와인', '술집', '야식']
};

// 예산 매핑
const BUDGET_MAPPING = {
  low: { min: 0, max: 15000, priceRanges: ['저렴', '보통'] },
  medium: { min: 10000, max: 35000, priceRanges: ['보통', '고급'] },
  high: { min: 25000, max: 80000, priceRanges: ['보통', '고급'] },
  luxury: { min: 50000, max: Infinity, priceRanges: ['고급', '럭셔리'] }
};

// 시간대별 카테고리 가중치
const TIME_CATEGORY_WEIGHTS = {
  morning: ['베이커리/카페', '카페', '브런치'],
  afternoon: ['카페', '베이커리/카페', '디저트', '한식', '양식', '일식'],
  evening: ['한식', '양식', '일식', '고기/구이', '파인다이닝', '아시안'],
  night: ['바/와인', '고기/구이', '한식', '아시안']
};

/**
 * 사용자 조건에 맞게 맛집 DB 필터링
 */
export function filterRestaurants(params) {
  const { region, mood, budget, time } = params;

  const regionConfig = REGION_MAPPING[region];
  const moodKeywords = MOOD_MAPPING[mood] || [];
  const budgetConfig = BUDGET_MAPPING[budget] || BUDGET_MAPPING.medium;
  const preferredCategories = TIME_CATEGORY_WEIGHTS[time] || [];

  let filtered = restaurants.filter(restaurant => {
    // 1. 지역 필터링
    if (regionConfig) {
      const regionMatch = restaurant.region === regionConfig.region;
      const districtMatch = regionConfig.districts.some(d =>
        restaurant.district?.includes(d)
      );
      const neighborhoodMatch = regionConfig.neighborhoods.some(n =>
        restaurant.neighborhood?.includes(n) || restaurant.address?.includes(n)
      );

      if (!regionMatch && !districtMatch && !neighborhoodMatch) {
        return false;
      }
    }

    // 2. 예산 필터링
    if (budgetConfig) {
      const priceMatch = budgetConfig.priceRanges.includes(restaurant.priceRange);
      const avgPriceMatch = restaurant.avgPrice >= budgetConfig.min * 0.5 &&
                           restaurant.avgPrice <= budgetConfig.max * 1.5;
      if (!priceMatch && !avgPriceMatch) {
        return false;
      }
    }

    return true;
  });

  // 3. 분위기 점수 계산 및 정렬
  filtered = filtered.map(restaurant => {
    let score = 0;

    // 분위기 매칭 점수
    if (restaurant.mood && Array.isArray(restaurant.mood)) {
      const moodMatches = restaurant.mood.filter(m =>
        moodKeywords.some(keyword => m.includes(keyword) || keyword.includes(m))
      );
      score += moodMatches.length * 10;
    }

    // 시간대 카테고리 점수
    if (preferredCategories.some(cat => restaurant.category?.includes(cat))) {
      score += 5;
    }

    // 평점 점수
    score += (restaurant.rating || 4.0) * 2;

    return { ...restaurant, matchScore: score };
  });

  // 점수순 정렬
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return filtered;
}

/**
 * 데이트 코스용 맛집 선별 (카테고리 다양성 확보)
 */
export function selectRestaurantsForCourse(filteredList, count = 30) {
  const categories = {
    meal: [], // 식사 (한식, 양식, 일식, 중식, 아시안, 파인다이닝)
    cafe: [], // 카페/디저트
    bar: [],  // 바/와인
    etc: []   // 기타
  };

  filteredList.forEach(r => {
    if (['한식', '양식', '일식', '중식', '아시안', '파인다이닝', '고기/구이', '브런치'].some(c => r.category?.includes(c))) {
      categories.meal.push(r);
    } else if (['카페', '베이커리', '디저트'].some(c => r.category?.includes(c))) {
      categories.cafe.push(r);
    } else if (['바', '와인'].some(c => r.category?.includes(c))) {
      categories.bar.push(r);
    } else {
      categories.etc.push(r);
    }
  });

  // 각 카테고리에서 균형있게 선택
  const selected = [];
  const mealCount = Math.min(categories.meal.length, Math.ceil(count * 0.5));
  const cafeCount = Math.min(categories.cafe.length, Math.ceil(count * 0.3));
  const barCount = Math.min(categories.bar.length, Math.ceil(count * 0.15));
  const etcCount = Math.min(categories.etc.length, count - mealCount - cafeCount - barCount);

  selected.push(...categories.meal.slice(0, mealCount));
  selected.push(...categories.cafe.slice(0, cafeCount));
  selected.push(...categories.bar.slice(0, barCount));
  selected.push(...categories.etc.slice(0, etcCount));

  return selected.slice(0, count);
}

/**
 * AI 프롬프트용 맛집 리스트 포맷팅
 */
export function formatRestaurantsForPrompt(restaurants) {
  return restaurants.map((r, idx) => {
    return `[${r.id}] ${r.name}
- 카테고리: ${r.category}
- 위치: ${r.neighborhood} (${r.address})
- 가격대: ${r.priceRange} (평균 ${r.avgPrice?.toLocaleString()}원)
- 분위기: ${r.mood?.join(', ')}
- 시그니처: ${r.signature}
- 평점: ${r.rating}
- 설명: ${r.description}
- 팁: ${r.tip}`;
  }).join('\n\n');
}

/**
 * AI 응답에서 선택된 맛집 ID로 상세 정보 매칭
 */
export function matchRestaurantsById(ids) {
  return ids.map(id => {
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant || null;
  }).filter(Boolean);
}

/**
 * 이름으로 맛집 검색 (유사 매칭)
 */
export function findRestaurantByName(name, region = null) {
  // 정확한 이름 매칭
  let match = restaurants.find(r => r.name === name);
  if (match) return match;

  // 부분 매칭
  match = restaurants.find(r => r.name.includes(name) || name.includes(r.name));
  if (match) return match;

  // 지역 + 카테고리 유사 매칭
  if (region) {
    const regionConfig = REGION_MAPPING[region];
    if (regionConfig) {
      const regionFiltered = restaurants.filter(r =>
        r.region === regionConfig.region ||
        regionConfig.neighborhoods.some(n => r.neighborhood?.includes(n))
      );

      // 이름에서 키워드 추출하여 매칭
      const keywords = name.split(/\s+/);
      match = regionFiltered.find(r =>
        keywords.some(k => r.name.includes(k) || r.category?.includes(k))
      );
    }
  }

  return match || null;
}

/**
 * 전체 DB 통계
 */
export function getDBStats() {
  const stats = {
    total: restaurants.length,
    byRegion: {},
    byCategory: {},
    byPriceRange: {}
  };

  restaurants.forEach(r => {
    stats.byRegion[r.region] = (stats.byRegion[r.region] || 0) + 1;
    stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + 1;
    stats.byPriceRange[r.priceRange] = (stats.byPriceRange[r.priceRange] || 0) + 1;
  });

  return stats;
}

export { restaurants };
