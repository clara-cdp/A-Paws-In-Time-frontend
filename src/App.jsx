import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

import Auth from './pages/Auth'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserDetail from './pages/AdminUserDetail'
import GameLobby from './pages/GameLobby'
import GameRoom from './pages/GameRoom'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        {/* Global Styled Routes via MainLayout */}
        <Route element={<MainLayout />}>
          
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/games" element={<GameLobby />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
          
        </Route>

        {/* Global Unstyled / Specific Layout Routes */}
        {/* The Game Room does NOT have the MainLayout wrapper */}
        <Route element={<ProtectedRoute />}>
           <Route path="/games/:id" element={<GameRoom />} />
        </Route>

      </Routes>
    </AuthProvider>
  )
}

export default App
