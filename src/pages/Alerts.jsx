import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ShieldAlert, AlertTriangle, Info, Package, MapPin, Clock, ArrowRight, ChevronRight } from 'lucide-react'
import { alerts } from '../data/demoData.js'

const typeTabs = [
  { key: 'all', label: 'All Alerts' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Low Stock & Delays' },
  { key: 'info', label: 'Info' },
]

export default function Alerts() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? alerts : alerts.filter(a => a.type === activeTab)
  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Alert Center</h1>
            <p className="page-header-subtitle">{alerts.length} active alerts requiring attention</p>
          </div>
        </div>
      </div>

      <div className="alert-tabs">
        {typeTabs.map(tab => (
          <button key={tab.key} className={`alert-tab${activeTab === tab.key ? ' active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
            <span className="alert-tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.map(alert => (
            <div key={alert.id} className="alert-item">
              <div className={`alert-icon ${alert.type}`}>
                {alert.type === 'critical' && <ShieldAlert size={16} />}
                {alert.type === 'warning' && <AlertTriangle size={16} />}
                {alert.type === 'info' && <Info size={16} />}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.desc}</div>
                <div className="alert-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {alert.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {alert.time}</span>
                </div>
                <div className="alert-actions">
                  <button className="btn btn-sm btn-primary">{alert.action}</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/products/${alert.productId}`)}>View Product <ChevronRight size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
