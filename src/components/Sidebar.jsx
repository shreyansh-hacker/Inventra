import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Map, ClipboardCheck, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, History,
  BookOpen, Bell, BarChart3, Settings, User, LogOut, ChevronLeft,
  ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react'

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
      { label: 'Receipts', icon: ArrowDownToLine, path: '/receipts', badge: 2 },
      { label: 'Deliveries', icon: ArrowUpFromLine, path: '/deliveries', badge: 3 },
      { label: 'Internal Transfers', icon: ArrowLeftRight, path: '/transfers', badge: 1 },
      { label: 'Adjustments', icon: SlidersHorizontal, path: '/adjustments' },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'Move History', icon: History, path: '/move-history' },
      { label: 'Stock Ledger', icon: BookOpen, path: '/stock-ledger' },
      { label: 'Alerts', icon: Bell, path: '/alerts', badge: 9 },
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

import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, destroySession } = useAuth()

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
            {section.items.map((item) => (
              <div
                key={item.path}
                className={`sidebar-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className="sidebar-item-icon" />
                <span className="sidebar-item-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-item-badge">{item.badge}</span>
                )}
              </div>
            ))}
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
