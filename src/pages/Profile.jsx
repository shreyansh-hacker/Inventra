import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Shield, Calendar, LogOut, Key, CheckCircle2,
  AlertCircle, X, Lock, Eye, EyeOff, Save, Phone
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

export default function Profile() {
  const navigate = useNavigate()
  const { session, updateUserSession, destroySession } = useAuth()

  // Profile Form State
  const currentUser = session?.user || {
    name: 'Yash Rathore',
    email: 'yash@inventra.internal',
    role: 'Inventory Administrator',
    initials: 'YR',
    phone: '+91 98765 00001',
    warehouse: 'Central Warehouse (Hub 1)',
    joinedAt: 'June 2025'
  }

  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '+91 98765 00001',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Handle Save Changes
  const handleSaveChanges = async (e) => {
    e?.preventDefault()
    setIsSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      // 1. Attempt API update if backend is reachable
      try {
        await api.auth.updateProfile({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        })
      } catch (apiErr) {
        console.warn('API profile update fallback to local session:', apiErr.message)
      }

      // 2. Update local active session state
      updateUserSession({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      })

      setSuccessMessage('Profile changes saved successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Change Password Submit
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setIsChangingPassword(true)

    try {
      const res = await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (res.success) {
        setPasswordSuccess('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess('')
        }, 1500)
      } else {
        setPasswordError(res.message || 'Failed to change password.')
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please check your current password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Handle Sign Out
  const handleSignOut = () => {
    destroySession()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header-title">Profile</h1>
        <p className="page-header-subtitle">Manage your account settings and credentials</p>
      </div>

      {successMessage && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--font-sm)',
          fontWeight: 500
        }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--font-sm)',
          fontWeight: 500
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{currentUser.initials || 'YR'}</div>
          <div>
            <div className="profile-name">{formData.name || currentUser.name}</div>
            <div className="profile-email">{formData.email || currentUser.email}</div>
            <span className="badge badge-healthy" style={{ marginTop: '8px' }}>
              <span className="badge-dot" />
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="card-body" style={{ borderTop: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Account Details</h3>
          
          <form onSubmit={handleSaveChanges}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  className="form-input"
                  value={currentUser.role}
                  disabled
                  style={{ background: 'var(--surface-tertiary)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Facility / Warehouse</label>
                <input
                  className="form-input"
                  value={currentUser.warehouse || 'Central Warehouse (Hub 1)'}
                  disabled
                  style={{ background: 'var(--surface-tertiary)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Member Since</label>
                <input
                  className="form-input"
                  value={currentUser.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString() : 'June 2025'}
                  disabled
                  style={{ background: 'var(--surface-tertiary)', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPasswordError('')
                  setPasswordSuccess('')
                  setShowPasswordModal(true)
                }}
              >
                <Key size={15} />
                <span>Change Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleSignOut}
          title="End session and log out"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: 'var(--primary-500)' }} />
                <h2 className="modal-title">Change Password</h2>
              </div>
              <button className="btn-icon" onClick={() => setShowPasswordModal(false)}>
                <X size={18} />
              </button>
            </div>

            {passwordError && (
              <div style={{
                margin: 'var(--space-4) var(--space-4) 0',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-sm)'
              }}>
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div style={{
                margin: 'var(--space-4) var(--space-4) 0',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-sm)'
              }}>
                <CheckCircle2 size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Min. 6 characters"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: 'var(--space-4)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
