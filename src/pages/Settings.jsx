import React, { useState } from 'react'
import { Building2, MapPin, Users, Tag, Ruler, Bell, Shield, Settings as SettingsIcon } from 'lucide-react'
import { warehouses, categories } from '../data/demoData.js'

const settingsNav = [
  { key: 'general', label: 'General', icon: SettingsIcon },
  { key: 'warehouses', label: 'Warehouses', icon: Building2 },
  { key: 'users', label: 'Users & Roles', icon: Users },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'units', label: 'Units of Measure', icon: Ruler },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header-title">Settings</h1>
        <p className="page-header-subtitle">Configure your INVENTRA workspace</p>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {settingsNav.map(item => (
            <div key={item.key} className={`settings-nav-item${activeSection === item.key ? ' active' : ''}`} onClick={() => setActiveSection(item.key)}>
              <item.icon size={18} />
              {item.label}
            </div>
          ))}
        </div>

        <div className="card">
          {activeSection === 'general' && (
            <div className="card-body">
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>General Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" defaultValue="INVENTRA Demo Corp" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-input form-select">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="form-input form-select">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select className="form-input form-select">
                    <option>YYYY-MM-DD</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeSection === 'warehouses' && (
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>Warehouses</h3>
                <button className="btn btn-primary btn-sm">+ Add Warehouse</button>
              </div>
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Code</th><th>Address</th><th>Manager</th><th className="text-right">Capacity</th><th className="text-right">Used</th></tr>
                  </thead>
                  <tbody>
                    {warehouses.map(w => (
                      <tr key={w.id}>
                        <td className="font-semibold">{w.name}</td>
                        <td className="text-mono">{w.shortCode}</td>
                        <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{w.address}</td>
                        <td>{w.manager}</td>
                        <td className="text-right">{w.capacity.toLocaleString()}</td>
                        <td className="text-right">{w.used.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>Users & Roles</h3>
                <button className="btn btn-primary btn-sm">+ Invite User</button>
              </div>
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td className="font-semibold">Yash Rathore</td><td>yash@inventra.io</td><td><span className="badge badge-healthy">Admin</span></td><td><span className="badge badge-done"><span className="badge-dot" />Active</span></td></tr>
                    <tr><td className="font-semibold">Amit Sharma</td><td>amit@inventra.io</td><td><span className="badge badge-watch">Inventory Manager</span></td><td><span className="badge badge-done"><span className="badge-dot" />Active</span></td></tr>
                    <tr><td className="font-semibold">Ravi Kumar</td><td>ravi@inventra.io</td><td><span className="badge badge-draft">Warehouse Staff</span></td><td><span className="badge badge-done"><span className="badge-dot" />Active</span></td></tr>
                    <tr><td className="font-semibold">Priya Verma</td><td>priya@inventra.io</td><td><span className="badge badge-draft">Viewer</span></td><td><span className="badge badge-draft"><span className="badge-dot" />Invited</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Role Permissions</h4>
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Permission</th><th className="text-center">Admin</th><th className="text-center">Inv. Manager</th><th className="text-center">WH Staff</th><th className="text-center">Viewer</th></tr></thead>
                    <tbody>
                      {['Products', 'Receipts', 'Deliveries', 'Transfers', 'Adjustments', 'Reports', 'Settings', 'Users'].map(p => (
                        <tr key={p}>
                          <td>{p}</td>
                          <td className="text-center">✓</td>
                          <td className="text-center">{['Products', 'Receipts', 'Deliveries', 'Transfers', 'Adjustments', 'Reports'].includes(p) ? '✓' : '—'}</td>
                          <td className="text-center">{['Receipts', 'Transfers'].includes(p) ? '✓' : '—'}</td>
                          <td className="text-center">{['Products', 'Reports'].includes(p) ? 'R' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'categories' && (
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>Categories</h3>
                <button className="btn btn-primary btn-sm">+ Add Category</button>
              </div>
              {categories.map(c => (
                <div key={c.id} style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <button className="btn btn-ghost btn-sm">Edit</button>
                </div>
              ))}
            </div>
          )}

          {!['general', 'warehouses', 'users', 'categories'].includes(activeSection) && (
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <SettingsIcon size={28} />
                </div>
                <div className="empty-state-title">{settingsNav.find(s => s.key === activeSection)?.label}</div>
                <div className="empty-state-desc">This settings section is ready for configuration.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
