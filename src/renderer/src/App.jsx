import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import NewReport from './pages/NewReport'
import EditReport from './pages/EditReport'
import ReportDetail from './pages/ReportDetail'
import MyReports from './pages/MyReports'
import { ToastProvider } from './components/Toast'

function Splash() {
  return <div className="splash">Loading…</div>
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="shell">
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
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
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
