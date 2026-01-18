// API 설정 (Groq)
// 환경변수에서 API 키를 읽어옵니다
export const CONFIG = {
  API_ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
  getApiKey: () => import.meta.env.VITE_GROQ_API_KEY || '',
  MODEL: 'llama-3.3-70b-versatile',

  // Kakao 이미지 검색 API
  KAKAO_API_KEY: import.meta.env.VITE_KAKAO_API_KEY || '',
  KAKAO_IMAGE_ENDPOINT: 'https://dapi.kakao.com/v2/search/image'
};
