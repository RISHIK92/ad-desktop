import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import api from './lib/api'
import usePolling from './lib/usePolling'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import NewReport from './pages/NewReport'
import EditReport from './pages/EditReport'
import ReportDetail from './pages/ReportDetail'
import MyReports from './pages/MyReports'
import Messages from './pages/Messages'
import Thread from './pages/Thread'
import Profile from './pages/Profile'

function Splash() {
  return <div className="splash">Loading…</div>
}

function Shell() {
  const location = useLocation()
  const [unread, setUnread] = useState(0)

  const refresh = useCallback(() => {
    api.messages
      .unreadCount()
      .then(setUnread)
      .catch(() => {})
  }, [])

  useEffect(refresh, [location.pathname, refresh])
  useEffect(() => {
    window.addEventListener('campusfind:unread', refresh)
    return () => window.removeEventListener('campusfind:unread', refresh)
  }, [refresh])
  usePolling(refresh, 10000)

  return (
    <div className="shell">
      <Navbar unread={unread} />
      <main className="page" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  )
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return <Shell />
}

function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/reports/new" element={<NewReport />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/reports/:id/edit" element={<EditReport />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:reportId/:userId" element={<Thread />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
