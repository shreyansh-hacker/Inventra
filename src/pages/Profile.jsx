import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Calendar, LogOut, Key } from 'lucide-react'
import { currentUser } from '../data/demoData.js'

export default function Profile() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header-title">Profile</h1>
        <p className="page-header-subtitle">Manage your account settings</p>
      </div>

      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{currentUser.avatar}</div>
          <div>
            <div className="profile-name">{currentUser.name}</div>
            <div className="profile-email">{currentUser.email}</div>
            <span className="badge badge-healthy" style={{ marginTop: '8px' }}><span className="badge-dot" />{currentUser.role}</span>
          </div>
        </div>

        <div className="card-body" style={{ borderTop: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Account Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" defaultValue={currentUser.name} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" defaultValue={currentUser.email} type="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value={currentUser.role} disabled style={{ background: 'var(--surface-tertiary)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Member Since</label>
              <input className="form-input" value={currentUser.joinedAt} disabled style={{ background: 'var(--surface-tertiary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button className="btn btn-primary">Save Changes</button>
            <button className="btn btn-secondary"><Key size={14} /> Change Password</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <button className="btn btn-danger" onClick={() => window.location.reload()}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  )
}
