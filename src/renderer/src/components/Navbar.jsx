import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ unread = 0 }) {
  const { user, logout } = useAuth()
  const link = ({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`
  return (
    <header className="nav">
      <div className="nav__brand">
        <span className="logo logo--sm">CF</span>
        CampusFind
      </div>
      <nav className="nav__links">
        <NavLink to="/" end className={link}>
          Dashboard
        </NavLink>
        <NavLink to="/browse" className={link}>
          Browse
        </NavLink>
        <NavLink to="/reports/new" className={link}>
          Report Item
        </NavLink>
        <NavLink to="/my-reports" className={link}>
          My Reports
        </NavLink>
        <NavLink to="/messages" className={link}>
          Messages
          {unread > 0 && <span className="pill pill--count">{unread}</span>}
        </NavLink>
      </nav>
      <div className="nav__user">
        <NavLink to="/profile" className="nav__name">
          {user?.name}
        </NavLink>
        <button className="btn btn--ghost btn--sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
