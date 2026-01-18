// 주요 지역별 대표 좌표 (위도, 경도)
const LOCATION_COORDS = {
  // 서울
  '강남구': { lat: 37.5172, lng: 127.0473 },
  '서초구': { lat: 37.4837, lng: 127.0324 },
  '송파구': { lat: 37.5145, lng: 127.1050 },
  '강동구': { lat: 37.5301, lng: 127.1238 },
  '마포구': { lat: 37.5663, lng: 126.9014 },
  '용산구': { lat: 37.5326, lng: 126.9900 },
  '종로구': { lat: 37.5735, lng: 126.9790 },
  '중구': { lat: 37.5641, lng: 126.9979 },
  '성동구': { lat: 37.5634, lng: 127.0369 },
  '광진구': { lat: 37.5385, lng: 127.0823 },
  '동대문구': { lat: 37.5744, lng: 127.0396 },
  '성북구': { lat: 37.5894, lng: 127.0167 },
  '강북구': { lat: 37.6396, lng: 127.0257 },
  '도봉구': { lat: 37.6688, lng: 127.0471 },
  '노원구': { lat: 37.6542, lng: 127.0568 },
  '은평구': { lat: 37.6027, lng: 126.9291 },
  '서대문구': { lat: 37.5791, lng: 126.9368 },
  '양천구': { lat: 37.5170, lng: 126.8666 },
  '강서구': { lat: 37.5509, lng: 126.8495 },
  '구로구': { lat: 37.4954, lng: 126.8874 },
  '금천구': { lat: 37.4519, lng: 126.8955 },
  '영등포구': { lat: 37.5264, lng: 126.8963 },
  '동작구': { lat: 37.5124, lng: 126.9393 },
  '관악구': { lat: 37.4784, lng: 126.9516 },
  '강남': { lat: 37.4979, lng: 127.0276 },

  // 동네
  '홍대': { lat: 37.5563, lng: 126.9220 },
  '이태원': { lat: 37.5345, lng: 126.9946 },
  '성수': { lat: 37.5447, lng: 127.0558 },
  '성수동': { lat: 37.5447, lng: 127.0558 },
  '을지로': { lat: 37.5660, lng: 126.9910 },
  '연남동': { lat: 37.5660, lng: 126.9250 },
  '망원동': { lat: 37.5560, lng: 126.9100 },
  '합정': { lat: 37.5496, lng: 126.9139 },
  '압구정': { lat: 37.5270, lng: 127.0280 },
  '청담동': { lat: 37.5200, lng: 127.0470 },
  '신사동': { lat: 37.5230, lng: 127.0230 },
  '삼청동': { lat: 37.5850, lng: 126.9820 },
  '북촌': { lat: 37.5826, lng: 126.9850 },
  '익선동': { lat: 37.5740, lng: 126.9880 },
  '삼각지': { lat: 37.5350, lng: 126.9720 },
  '한남동': { lat: 37.5340, lng: 127.0000 },
  '서울숲': { lat: 37.5445, lng: 127.0374 },
  '건대': { lat: 37.5404, lng: 127.0692 },
  '왕십리': { lat: 37.5614, lng: 127.0379 },
  '잠실': { lat: 37.5133, lng: 127.1001 },
  '여의도': { lat: 37.5219, lng: 126.9245 },

  // 부산
  '부산': { lat: 35.1796, lng: 129.0756 },
  '해운대구': { lat: 35.1631, lng: 129.1635 },
  '해운대': { lat: 35.1587, lng: 129.1604 },
  '수영구': { lat: 35.1457, lng: 129.1130 },
  '광안리': { lat: 35.1532, lng: 129.1186 },
  '서면': { lat: 35.1578, lng: 129.0599 },
  '남포동': { lat: 35.0982, lng: 129.0324 },
  '부산진구': { lat: 35.1629, lng: 129.0533 },
  '중구': { lat: 35.1064, lng: 129.0324 },

  // 경기
  '경기': { lat: 37.4138, lng: 127.5183 },
  '성남시': { lat: 37.4449, lng: 127.1389 },
  '분당': { lat: 37.3595, lng: 127.1132 },
  '판교': { lat: 37.3947, lng: 127.1119 },
  '수원시': { lat: 37.2636, lng: 127.0286 },
  '용인시': { lat: 37.2410, lng: 127.1775 },
  '고양시': { lat: 37.6584, lng: 126.8320 },

  // 인천
  '인천': { lat: 37.4563, lng: 126.7052 },
  '연수구': { lat: 37.4100, lng: 126.6783 },
  '송도': { lat: 37.3915, lng: 126.6435 },

  // 제주
  '제주': { lat: 33.4996, lng: 126.5312 },
  '제주시': { lat: 33.4996, lng: 126.5312 },
  '서귀포': { lat: 33.2541, lng: 126.5600 },
  '서귀포시': { lat: 33.2541, lng: 126.5600 },

  // 기타 광역시
  '대구': { lat: 35.8714, lng: 128.6014 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '세종': { lat: 36.4800, lng: 127.2890 },

  // 기타 도
  '강원': { lat: 37.8228, lng: 128.1555 },
  '강릉': { lat: 37.7519, lng: 128.8761 },
  '속초': { lat: 38.2070, lng: 128.5918 },
  '충북': { lat: 36.6357, lng: 127.4912 },
  '충남': { lat: 36.5184, lng: 126.8000 },
  '전북': { lat: 35.8203, lng: 127.1088 },
  '전주': { lat: 35.8242, lng: 127.1480 },
  '전남': { lat: 34.8161, lng: 126.4629 },
  '여수': { lat: 34.7604, lng: 127.6622 },
  '경북': { lat: 36.4919, lng: 128.8889 },
  '경주': { lat: 35.8562, lng: 129.2247 },
  '경남': { lat: 35.4606, lng: 128.2132 },
}

/**
 * 두 좌표 간 거리 계산 (Haversine 공식)
 * @returns 거리 (미터)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000 // 지구 반경 (미터)
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

/**
 * 레스토랑의 대략적인 좌표 가져오기
 */
export function getRestaurantCoords(restaurant) {
  // neighborhood, district, region 순서로 좌표 찾기
  const locations = [
    restaurant.neighborhood,
    restaurant.district,
    restaurant.region
  ]

  for (const loc of locations) {
    if (loc && LOCATION_COORDS[loc]) {
      return LOCATION_COORDS[loc]
    }
  }

  // 못 찾으면 서울 중심 반환
  return { lat: 37.5665, lng: 126.9780 }
}

/**
 * 현재 위치에서 일정 거리 내의 레스토랑 필터링
 * @param restaurants - 레스토랑 배열
 * @param userLat - 사용자 위도
 * @param userLng - 사용자 경도
 * @param maxDistance - 최대 거리 (미터)
 */
export function filterByDistance(restaurants, userLat, userLng, maxDistance) {
  return restaurants.filter(restaurant => {
    const coords = getRestaurantCoords(restaurant)
    const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng)
    return distance <= maxDistance
  }).map(restaurant => {
    const coords = getRestaurantCoords(restaurant)
    const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng)
    return { ...restaurant, distance }
  }).sort((a, b) => a.distance - b.distance)
}

/**
 * 거리를 읽기 쉬운 형태로 포맷
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 좌표로 가장 가까운 지역명 찾기
 */
export function findNearestLocation(lat, lng) {
  let nearest = null
  let minDistance = Infinity

  Object.entries(LOCATION_COORDS).forEach(([name, coords]) => {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearest = name
    }
  })

  return nearest
}

/**
 * 선택 가능한 지역 목록 반환
 */
export function getSelectableLocations() {
  return [
    { id: 'current', label: '현재 위치 (GPS)', type: 'gps' },
    { id: 'all', label: '전체 검색 (위치 제한 없음)', type: 'all' },
    { id: 'separator-1', type: 'separator', label: '서울' },
    { id: '강남구', label: '강남구', coords: LOCATION_COORDS['강남구'] },
    { id: '서초구', label: '서초구', coords: LOCATION_COORDS['서초구'] },
    { id: '마포구', label: '마포구', coords: LOCATION_COORDS['마포구'] },
    { id: '용산구', label: '용산구', coords: LOCATION_COORDS['용산구'] },
    { id: '성동구', label: '성동구 (성수)', coords: LOCATION_COORDS['성동구'] },
    { id: '종로구', label: '종로구', coords: LOCATION_COORDS['종로구'] },
    { id: '중구', label: '중구 (을지로)', coords: LOCATION_COORDS['중구'] },
    { id: '송파구', label: '송파구 (잠실)', coords: LOCATION_COORDS['송파구'] },
    { id: '영등포구', label: '영등포구 (여의도)', coords: LOCATION_COORDS['영등포구'] },
    { id: 'separator-2', type: 'separator', label: '수도권' },
    { id: '분당', label: '분당', coords: LOCATION_COORDS['분당'] },
    { id: '판교', label: '판교', coords: LOCATION_COORDS['판교'] },
    { id: '인천', label: '인천', coords: LOCATION_COORDS['인천'] },
    { id: 'separator-3', type: 'separator', label: '부산' },
    { id: '해운대', label: '해운대', coords: LOCATION_COORDS['해운대'] },
    { id: '서면', label: '서면', coords: LOCATION_COORDS['서면'] },
    { id: '광안리', label: '광안리', coords: LOCATION_COORDS['광안리'] },
    { id: 'separator-4', type: 'separator', label: '기타 지역' },
    { id: '제주', label: '제주', coords: LOCATION_COORDS['제주'] },
    { id: '대구', label: '대구', coords: LOCATION_COORDS['대구'] },
    { id: '대전', label: '대전', coords: LOCATION_COORDS['대전'] },
    { id: '광주', label: '광주', coords: LOCATION_COORDS['광주'] },
    { id: '전주', label: '전주', coords: LOCATION_COORDS['전주'] },
    { id: '강릉', label: '강릉', coords: LOCATION_COORDS['강릉'] },
  ]
}

// LOCATION_COORDS export
export { LOCATION_COORDS }
