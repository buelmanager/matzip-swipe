import ChatBot from '../components/ChatBot'

export default function ChatPage() {
  return (
    <div className="page chat-page">
      <header className="page-header">
        <h1>AI 맛집 검색</h1>
        <p>원하는 맛집을 물어보세요</p>
      </header>

      <ChatBot />
    </div>
  )
}
