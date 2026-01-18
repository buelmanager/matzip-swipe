import { CONFIG } from './config';
import {
  filterRestaurants,
  selectRestaurantsForCourse,
  formatRestaurantsForPrompt,
  findRestaurantByName
} from './restaurantDB';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    if (response.status === 429) {
      const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.log(`Rate limited. Waiting ${Math.round(waitTime/1000)}s before retry...`);

      if (attempt < maxRetries - 1) {
        await delay(waitTime);
        continue;
      }
    }

    if (response.status !== 429) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API 요청 실패: ${response.status} - ${errorData.error?.message || ''}`);
    }
  }

  throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
}

const MOOD_LABELS = {
  romantic: '로맨틱한',
  active: '활동적인',
  chill: '힐링/여유로운',
  foodie: '맛집 중심',
  culture: '문화/예술',
  night: '야경/밤 분위기'
};

const BUDGET_LABELS = {
  low: '5만원 이하 (저렴하게)',
  medium: '5-10만원 (적당히)',
  high: '10-20만원 (여유롭게)',
  luxury: '20만원 이상 (럭셔리하게)'
};

const TIME_LABELS = {
  morning: '오전 (10시~12시)',
  afternoon: '오후 (12시~18시)',
  evening: '저녁 (18시~21시)',
  night: '밤 (21시 이후)'
};

export async function generateDateCourse(params) {
  const { region, mood, budget, time, extra } = params;

  console.log('=== 맛집 DB 필터링 ===');

  // 1단계: 사용자 조건으로 DB 필터링
  const filteredRestaurants = filterRestaurants(params);
  console.log(`필터링된 맛집 수: ${filteredRestaurants.length}개`);

  // 2단계: 코스용 맛집 선별 (최대 40개)
  const selectedRestaurants = selectRestaurantsForCourse(filteredRestaurants, 40);
  console.log(`선별된 맛집 수: ${selectedRestaurants.length}개`);

  // 3단계: AI 프롬프트용 포맷팅
  const restaurantListText = formatRestaurantsForPrompt(selectedRestaurants);

  const prompt = `당신은 데이트 코스 전문 플래너입니다.
아래 맛집/카페 리스트에서 선택하여 데이트 코스를 구성해주세요.

## 조건
- 지역: ${region}
- 분위기: ${MOOD_LABELS[mood] || mood}
- 예산: ${budget ? BUDGET_LABELS[budget] : '제한 없음'}
- 시간대: ${TIME_LABELS[time] || time}
${extra ? `- 추가 요청: ${extra}` : ''}

## 선택 가능한 맛집 리스트
${restaurantListText}

## 중요 지침
1. 반드시 위 리스트에서만 선택하세요
2. 각 장소의 [ID] 번호를 정확히 포함해주세요
3. 시간 순서대로 3-5개 장소를 구성하세요
4. 식사 → 카페 → 저녁/바 등 자연스러운 흐름으로 구성하세요
5. 총 예산이 조건에 맞게 조절하세요

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "title": "코스 제목 (예: 성수동 감성 데이트)",
  "summary": "코스 한줄 설명 (왜 이 코스를 추천하는지)",
  "spots": [
    {
      "id": 숫자 (위 리스트의 ID),
      "time": "시작 시간 (예: 14:00)",
      "customDescription": "이 장소를 선택한 이유와 데이트 팁 (2-3문장)"
    }
  ],
  "totalBudget": "예상 총 비용 (예: 약 8만원)",
  "courseHighlight": "이 코스의 특별한 포인트 (예: 인생샷 스팟이 3곳이나!)"
}`;

  const requestBody = {
    model: CONFIG.MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  };

  console.log('=== API 요청 ===');

  const response = await fetchWithRetry(
    CONFIG.API_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.getApiKey()}`
      },
      body: JSON.stringify(requestBody)
    }
  );

  const data = await response.json();

  console.log('=== API 응답 ===');

  if (data.choices && data.choices[0] && data.choices[0].message) {
    const content = data.choices[0].message.content.trim();

    try {
      let jsonStr = content;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          jsonStr = content.substring(startIdx, endIdx + 1);
        }
      }

      const result = JSON.parse(jsonStr);
      console.log('=== 파싱 결과 ===', result);

      // 4단계: AI가 선택한 ID로 DB에서 상세 정보 매칭
      const spotsWithFullData = result.spots.map(spot => {
        // ID로 맛집 찾기
        let restaurant = selectedRestaurants.find(r => r.id === spot.id);

        // ID 매칭 실패시 이름으로 시도
        if (!restaurant && spot.name) {
          restaurant = findRestaurantByName(spot.name, region);
        }

        if (restaurant) {
          return {
            // DB에서 가져온 상세 정보
            id: restaurant.id,
            name: restaurant.name,
            category: restaurant.category,
            address: restaurant.address,
            priceRange: restaurant.priceRange,
            avgPrice: restaurant.avgPrice,
            mood: restaurant.mood,
            signature: restaurant.signature,
            rating: restaurant.rating,
            description: restaurant.description,
            tip: restaurant.tip,
            imageUrl: restaurant.imageUrl,
            neighborhood: restaurant.neighborhood,
            // AI가 생성한 정보
            time: spot.time,
            customDescription: spot.customDescription || restaurant.description,
            isFromDB: true
          };
        }

        // 매칭 실패시 기본 정보
        return {
          name: spot.name || '장소',
          time: spot.time,
          description: spot.customDescription || '',
          isFromDB: false
        };
      }).filter(spot => spot.isFromDB); // DB 매칭된 것만 사용

      // 매칭된 결과가 부족하면 추가 선택
      if (spotsWithFullData.length < 3) {
        console.log('DB 매칭 부족, 추천 맛집 자동 추가');
        const usedIds = spotsWithFullData.map(s => s.id);
        const additionalSpots = selectedRestaurants
          .filter(r => !usedIds.includes(r.id))
          .slice(0, 5 - spotsWithFullData.length)
          .map((r, idx) => ({
            ...r,
            time: getTimeSlot(time, spotsWithFullData.length + idx),
            customDescription: `${r.mood?.join(', ')} 분위기의 ${r.category}. ${r.description}`,
            isFromDB: true
          }));
        spotsWithFullData.push(...additionalSpots);
      }

      return {
        title: result.title || `${region} 데이트 코스`,
        summary: result.summary || '맞춤 추천 데이트 코스입니다.',
        spots: spotsWithFullData,
        totalBudget: result.totalBudget || calculateTotalBudget(spotsWithFullData),
        courseHighlight: result.courseHighlight || '',
        matchedFromDB: spotsWithFullData.filter(s => s.isFromDB).length,
        totalSpots: spotsWithFullData.length
      };

    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      console.log('원본 응답:', content);

      // 파싱 실패시 필터링된 맛집으로 자동 코스 생성
      return createFallbackCourse(selectedRestaurants, params);
    }
  }

  throw new Error('응답 형식이 올바르지 않습니다.');
}

// 시간대별 시간 슬롯 생성
function getTimeSlot(timeOfDay, index) {
  const slots = {
    morning: ['10:00', '11:00', '12:00', '13:00', '14:00'],
    afternoon: ['12:00', '14:00', '15:30', '17:00', '18:00'],
    evening: ['18:00', '19:30', '21:00', '22:00', '23:00'],
    night: ['20:00', '21:30', '23:00', '00:00', '01:00']
  };
  return slots[timeOfDay]?.[index] || `${12 + index * 2}:00`;
}

// 예산 계산
function calculateTotalBudget(spots) {
  const total = spots.reduce((sum, spot) => sum + (spot.avgPrice || 20000), 0);
  return `약 ${Math.round(total / 10000)}만원`;
}

// 폴백 코스 생성
function createFallbackCourse(restaurants, params) {
  const { time } = params;

  // 카테고리별로 분류
  const meals = restaurants.filter(r =>
    ['한식', '양식', '일식', '파인다이닝', '고기/구이'].some(c => r.category?.includes(c))
  );
  const cafes = restaurants.filter(r =>
    ['카페', '베이커리', '디저트'].some(c => r.category?.includes(c))
  );
  const bars = restaurants.filter(r =>
    ['바', '와인'].some(c => r.category?.includes(c))
  );

  const spots = [];

  // 시간대에 따른 코스 구성
  if (time === 'morning' || time === 'afternoon') {
    if (cafes[0]) spots.push({ ...cafes[0], time: getTimeSlot(time, 0) });
    if (meals[0]) spots.push({ ...meals[0], time: getTimeSlot(time, 1) });
    if (cafes[1]) spots.push({ ...cafes[1], time: getTimeSlot(time, 2) });
  } else {
    if (meals[0]) spots.push({ ...meals[0], time: getTimeSlot(time, 0) });
    if (cafes[0]) spots.push({ ...cafes[0], time: getTimeSlot(time, 1) });
    if (bars[0] || meals[1]) spots.push({ ...(bars[0] || meals[1]), time: getTimeSlot(time, 2) });
  }

  return {
    title: `${params.region} 추천 코스`,
    summary: '조건에 맞는 인기 맛집으로 구성한 코스입니다.',
    spots: spots.map(s => ({
      ...s,
      customDescription: s.description,
      isFromDB: true
    })),
    totalBudget: calculateTotalBudget(spots),
    courseHighlight: '엄선된 인기 맛집들로 구성했어요!',
    matchedFromDB: spots.length,
    totalSpots: spots.length
  };
}
