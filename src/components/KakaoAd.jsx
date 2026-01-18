import { useEffect, useRef } from 'react'

export default function KakaoAd({ unitId = 'DAN-xpJbZV074064dYjU', width = 300, height = 250 }) {
  const adRef = useRef(null)
  const isLoaded = useRef(false)

  useEffect(() => {
    // 이미 로드되었으면 스킵
    if (isLoaded.current) return

    // 카카오 광고 스크립트 로드
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
    script.async = true

    script.onload = () => {
      // 광고 초기화
      if (window.kakaoAdFit && adRef.current) {
        try {
          window.kakaoAdFit.push({})
        } catch (e) {
          console.log('Ad already initialized')
        }
      }
    }

    document.body.appendChild(script)
    isLoaded.current = true

    return () => {
      // 컴포넌트 언마운트 시 정리하지 않음 (스크립트는 한 번만 로드)
    }
  }, [])

  return (
    <div className="kakao-ad-container">
      <ins
        className="kakao_ad_area"
        style={{ display: 'block', width: `${width}px`, height: `${height}px`, margin: '0 auto' }}
        data-ad-unit={unitId}
        data-ad-width={width}
        data-ad-height={height}
        ref={adRef}
      />
    </div>
  )
}
