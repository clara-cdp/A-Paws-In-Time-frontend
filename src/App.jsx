import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserDetail from './pages/AdminUserDetail'
import GameLobby from './pages/GameLobby'
import GameRoom from './pages/GameRoom'

function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        <strong>Navigation: </strong>
        <a href="/auth" style={{ marginRight: '1rem' }}>Auth</a>
        <a href="/profile" style={{ marginRight: '1rem' }}>Profile</a>
        <a href="/admin/users" style={{ marginRight: '1rem' }}>Admin Dashboard</a>
        <a href="/games" style={{ marginRight: '1rem' }}>Game Lobby</a>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/games" element={<GameLobby />} />
        <Route path="/games/:id" element={<GameRoom />} />
      </Routes>
    </div>
  )
}

export default App
