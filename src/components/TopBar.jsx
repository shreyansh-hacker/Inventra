import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, HelpCircle, ChevronRight, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/inventory-map': 'Inventory Map',
  '/stock-count': 'Stock Count',
  '/receipts': 'Receipts',
  '/deliveries': 'Deliveries',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Adjustments',
  '/move-history': 'Move History',
  '/stock-ledger': 'Stock Ledger',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

const breadcrumbs = {
  '/': [{ label: 'INVENTRA' }, { label: 'Dashboard', current: true }],
  '/products': [{ label: 'INVENTRA' }, { label: 'Inventory' }, { label: 'Products', current: true }],
  '/inventory-map': [{ label: 'INVENTRA' }, { label: 'Inventory' }, { label: 'Map', current: true }],
  '/stock-count': [{ label: 'INVENTRA' }, { label: 'Inventory' }, { label: 'Stock Count', current: true }],
  '/receipts': [{ label: 'INVENTRA' }, { label: 'Operations' }, { label: 'Receipts', current: true }],
  '/deliveries': [{ label: 'INVENTRA' }, { label: 'Operations' }, { label: 'Deliveries', current: true }],
  '/transfers': [{ label: 'INVENTRA' }, { label: 'Operations' }, { label: 'Transfers', current: true }],
  '/adjustments': [{ label: 'INVENTRA' }, { label: 'Operations' }, { label: 'Adjustments', current: true }],
  '/move-history': [{ label: 'INVENTRA' }, { label: 'Tracking' }, { label: 'Move History', current: true }],
  '/stock-ledger': [{ label: 'INVENTRA' }, { label: 'Tracking' }, { label: 'Stock Ledger', current: true }],
  '/alerts': [{ label: 'INVENTRA' }, { label: 'Tracking' }, { label: 'Alerts', current: true }],
  '/reports': [{ label: 'INVENTRA' }, { label: 'Management' }, { label: 'Reports', current: true }],
  '/settings': [{ label: 'INVENTRA' }, { label: 'Management' }, { label: 'Settings', current: true }],
  '/profile': [{ label: 'INVENTRA' }, { label: 'Profile', current: true }],
}

export default function TopBar({ collapsed, onSearchOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, destroySession } = useAuth()

  const basePath = '/' + (location.pathname.split('/')[1] || '')
  const title = pageTitles[basePath] || 'INVENTRA'
  const crumbs = breadcrumbs[basePath] || [{ label: 'INVENTRA' }, { label: title, current: true }]

  const handleLogout = () => {
    destroySession()
    navigate('/login', { replace: true })
  }

  return (
    <header className={`topbar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={12} />}
                <span className={c.current ? 'current' : ''}>{c.label}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-search" onClick={onSearchOpen}>
          <Search size={16} />
          <span>Search anything...</span>
          <span className="topbar-search-shortcut">⌘K</span>
        </button>

        {session && (
          <div className="topbar-session-badge" title={`Active Session: ${session.sessionId}`}>
            <span className="topbar-session-dot" />
            <span className="topbar-session-user">{session.user?.name}</span>
          </div>
        )}

        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <button 
          className="topbar-icon-btn topbar-logout-btn" 
          onClick={handleLogout} 
          title="Destroy Session & Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
