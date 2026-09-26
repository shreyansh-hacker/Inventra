import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Map, ClipboardCheck, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, History,
  BookOpen, Bell, BarChart3, Settings, LogOut, ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

const navSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Products', icon: Package, path: '/products' },
      { label: 'Inventory Map', icon: Map, path: '/inventory-map' },
      { label: 'Stock Count', icon: ClipboardCheck, path: '/stock-count' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Receipts', icon: ArrowDownToLine, path: '/receipts', badgeKey: 'receipts' },
      { label: 'Deliveries', icon: ArrowUpFromLine, path: '/deliveries', badgeKey: 'deliveries' },
      { label: 'Internal Transfers', icon: ArrowLeftRight, path: '/transfers', badgeKey: 'transfers' },
      { label: 'Adjustments', icon: SlidersHorizontal, path: '/adjustments', badgeKey: 'adjustments' },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'Move History', icon: History, path: '/move-history' },
      { label: 'Stock Ledger', icon: BookOpen, path: '/stock-ledger' },
      { label: 'Alerts', icon: Bell, path: '/alerts', badgeKey: 'alerts' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Reports', icon: BarChart3, path: '/reports' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, destroySession } = useAuth()

  const [badgeCounts, setBadgeCounts] = useState({
    receipts: 0,
    deliveries: 0,
    transfers: 0,
    adjustments: 0,
    alerts: 0,
  })

  useEffect(() => {
    let isMounted = true

    const fetchCounts = async () => {
      try {
        const [sumRes, alertRes] = await Promise.allSettled([
          api.dashboard.getSummary(),
          api.alerts.getAll({ status: 'open' })
        ])

        if (isMounted) {
          let updated = { ...badgeCounts }
          if (sumRes.status === 'fulfilled' && sumRes.value?.success && sumRes.value.data) {
            const d = sumRes.value.data
            updated.receipts = d.pendingReceipts ?? 0
            updated.deliveries = d.pendingDeliveries ?? 0
            updated.transfers = d.activeTransfers ?? 0
            updated.adjustments = d.pendingAdjustments ?? 0
          }
          if (alertRes.status === 'fulfilled' && alertRes.value?.success && Array.isArray(alertRes.value.data)) {
            updated.alerts = alertRes.value.data.filter(a => !a.isResolved).length
          }
          setBadgeCounts(updated)
        }
      } catch (e) {
        // Silently handle error
      }
    }

    fetchCounts()
    const interval = setInterval(fetchCounts, 15000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = (e) => {
    e.stopPropagation()
    destroySession()
    navigate('/login', { replace: true })
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">I</div>
          <span className="sidebar-logo-text">INVENTRA</span>
        </div>
      </div>

      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => {
              const count = item.badgeKey ? badgeCounts[item.badgeKey] : 0
              return (
                <div
                  key={item.path}
                  className={`sidebar-item${isActive(item.path) ? ' active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} className="sidebar-item-icon" />
                  <span className="sidebar-item-label">{item.label}</span>
                  {count > 0 && (
                    <span className="sidebar-item-badge">{count}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="sidebar-user-avatar">
            {session?.user?.initials || 'YR'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{session?.user?.name || 'Yash Rathore'}</div>
            <div className="sidebar-user-role">{session?.user?.role || 'Admin'}</div>
          </div>
          {!collapsed && (
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Destroy session & Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
