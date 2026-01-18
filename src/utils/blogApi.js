import { CONFIG } from './config';

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

export async function searchRestaurantsAndWriteBlog(query, region) {
  console.log('=== 블로그 API 요청 ===');
  console.log('검색어:', query);
  console.log('지역:', region);

  // Step 1: Groq에게 웹 검색 시뮬레이션 + 블로그 글 작성 요청
  const prompt = `당신은 맛집 전문 블로거입니다. "${region} ${query} 맛집"에 대한 블로그 글을 작성해주세요.

실제 존재하는 유명한 맛집들을 5개 추천하고, 각 맛집에 대해 상세하게 설명해주세요.
실제 맛집 이름, 실제 메뉴, 실제 가격대를 사용해주세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "title": "블로그 제목 (예: 강남 파스타 맛집 BEST 5 | 분위기 좋은 이탈리안 레스토랑)",
  "intro": "블로그 도입부 (2-3문장, 검색 경험담 포함)",
  "restaurants": [
    {
      "name": "맛집 이름",
      "category": "음식 카테고리 (예: 이탈리안, 한식, 일식)",
      "priceRange": "가격대 (예: 1-2만원, 3-5만원)",
      "description": "맛집 상세 설명 (3-4문장, 분위기, 맛, 서비스 등)",
      "signature": "시그니처 메뉴 (예: 트러플 파스타, 한우 등심)",
      "tip": "방문 꿀팁 (예: 웨이팅 피하려면 오픈런 추천)"
    }
  ],
  "conclusion": "마무리 글 (2-3문장)"
}

5개의 실제 맛집을 추천해주세요. 허구의 맛집을 만들지 말고, 실제로 ${region}에 존재하는 유명한 ${query} 맛집을 추천해주세요.`;

  const requestBody = {
    model: CONFIG.MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000,
  };

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

  console.log('=== 블로그 API 응답 ===');
  console.log('전체 응답:', JSON.stringify(data, null, 2));

  if (data.choices && data.choices[0] && data.choices[0].message) {
    const content = data.choices[0].message.content.trim();
    console.log('응답 콘텐츠:', content);

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
      console.log('=== 파싱 결과 ===');
      console.log('파싱된 데이터:', result);

      return result;
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      console.log('원본 응답:', content);
      throw new Error('응답을 파싱할 수 없습니다.');
    }
  }

  throw new Error('응답 형식이 올바르지 않습니다.');
}
