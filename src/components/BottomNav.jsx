import { NavLink } from 'react-router-dom'
import { FiCompass, FiHeart, FiShuffle, FiUser, FiMessageCircle } from 'react-icons/fi'
import { useSaved } from '../contexts/SavedContext'

export default function BottomNav() {
  const { savedCount } = useSaved()

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiCompass />
        <span>탐색</span>
      </NavLink>
      <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon-wrap">
          <FiHeart />
          {savedCount > 0 && <span className="badge">{savedCount}</span>}
        </div>
        <span>저장</span>
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiMessageCircle />
        <span>AI검색</span>
      </NavLink>
      <NavLink to="/random" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiShuffle />
        <span>랜덤</span>
      </NavLink>
      <NavLink to="/my" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiUser />
        <span>마이</span>
      </NavLink>
    </nav>
  )
}
