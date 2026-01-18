import { Routes, Route } from 'react-router-dom'
import { SavedProvider } from './contexts/SavedContext'
import BottomNav from './components/BottomNav'
import ExplorePage from './pages/ExplorePage'
import SavedPage from './pages/SavedPage'
import ChatPage from './pages/ChatPage'
import RandomPage from './pages/RandomPage'
import MyPage from './pages/MyPage'
import './styles/index.css'

function App() {
  return (
    <SavedProvider>
      <div className="app">
        <main className="main">
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/random" element={<RandomPage />} />
            <Route path="/my" element={<MyPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </SavedProvider>
  )
}

export default App
