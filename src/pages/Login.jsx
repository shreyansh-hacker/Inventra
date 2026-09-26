import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight, Warehouse, KeyRound, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react'

export default function Login() {
  const { session, createSession } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('yash@inventra.internal')
  const [password, setPassword] = useState('••••••••••••')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeRole, setActiveRole] = useState('Admin')
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotResetToken, setForgotResetToken] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotInfo, setForgotInfo] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // If already authenticated, redirect straight to dashboard
  if (session) {
    return <Navigate to="/" replace />
  }

  const handleDemoSelect = (roleName, demoEmail, demoPass) => {
    setActiveRole(roleName)
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your company email address.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await api.auth.login({ email: email.trim(), password, rememberMe })
      const user = data?.user || data?.data?.user
      const token = data?.token || data?.data?.token

      if (data?.success && user) {
        createSession({
          email: user.email,
          name: user.name,
          role: user.role,
          token,
          rememberMe,
        })
        setIsLoading(false)
        navigate('/', { replace: true })
        return
      }
    } catch {
      // Backend not running: proceed with client-side session creation
    }

    // Client-side fallback session
    try {
      createSession({
        email: email.trim(),
        name: email.toLowerCase().includes('garage') || email.toLowerCase().includes('gargee')
          ? 'Gargee Sharma'
          : email.toLowerCase().includes('audichya')
          ? 'Yash Audichya'
          : 'Yash Rathore',
        role: activeRole === 'Manager'
          ? 'Warehouse Operations Manager'
          : activeRole === 'Auditor'
          ? 'Inventory Quality Auditor'
          : 'Inventory Administrator',
        rememberMe,
      })
      setIsLoading(false)
      navigate('/', { replace: true })
    } catch (err) {
      setIsLoading(false)
      setError('Failed to establish operational session. Please try again.')
    }
  }

  const openForgotModal = () => {
    setForgotEmail(email.trim())
    setForgotStep('email')
    setForgotOtp('')
    setForgotResetToken('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
    setForgotInfo('')
    setForgotError('')
    setIsForgotOpen(true)
  }

  const closeForgotModal = () => {
    setIsForgotOpen(false)
    setForgotLoading(false)
    setForgotError('')
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setForgotError('Enter your enterprise email first.')
      return
    }

    setForgotLoading(true)
    setForgotError('')
    setForgotInfo('')

    try {
      const forgotRes = await api.auth.forgotPassword(forgotEmail.trim())
      let message = forgotRes?.message || 'OTP dispatched. Check your secure channel.'
      if (forgotRes?.debugOtp) {
        message += ` Dev OTP: ${forgotRes.debugOtp}`
      }

      setForgotInfo(message)
      setForgotStep('otp')
    } catch (err) {
      setForgotError(err?.message || 'Unable to request OTP. Please retry.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!forgotOtp.trim()) {
      setForgotError('Enter the OTP sent to your channel.')
      return
    }

    setForgotLoading(true)
    setForgotError('')

    try {
      const verifyRes = await api.auth.verifyOtp(forgotEmail.trim(), forgotOtp.trim())
      const resetToken = verifyRes?.data?.resetToken
      if (!resetToken) {
        setForgotError('Unable to verify OTP. Request a fresh OTP.')
        setForgotLoading(false)
        return
      }

      setForgotResetToken(resetToken)
      setForgotStep('reset')
      setForgotInfo('OTP verified. Create a new password now.')
    } catch (err) {
      setForgotError(err?.message || 'Invalid or expired OTP.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (forgotNewPassword.length < 8) {
      setForgotError('Password must be at least 8 characters.')
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New password and confirm password do not match.')
      return
    }

    setForgotLoading(true)
    setForgotError('')

    try {
      await api.auth.resetPassword(forgotEmail.trim(), forgotResetToken, forgotNewPassword)
      setPassword('')
      setForgotStep('done')
      setForgotInfo('Password reset successful. Use your new password to sign in.')
    } catch (err) {
      setForgotError(err?.message || 'Password reset failed. Please retry.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="login-viewport">
      {/* Background Decor */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-container">
        {/* Left Side: Brand & Live Inventory Operational Preview */}
        <div className="login-brand-panel">
          <div className="login-brand-header">
            <div className="login-brand-logo-icon">I</div>
            <div className="login-brand-title">
              <span className="login-brand-name">INVENTRA</span>
              <span className="login-brand-tag">OPERATIONAL MAP v2.4</span>
            </div>
          </div>

          <div className="login-hero-text">
            <h2>Inventory as a live operational map.</h2>
            <p>
              Replace disconnected registers, WhatsApp threads, and static Excel sheets with real-time zone tracking, bin-level accuracy, and end-to-end stock custody.
            </p>
          </div>


          <div className="login-quote-card">
            <div className="quote-text">
              "Every unit in our warehouse now has an exact location, stage, and verifiable handler trail."
            </div>
            <div className="quote-author">— Operations Lead, Central Hub</div>
          </div>
        </div>

        {/* Right Side: Interactive Session Creation Form */}
        <div className="login-form-panel">
          <div className="login-form-card">
            <div className="login-card-header">
              <div className="session-status-badge">
                <span className="session-indicator-dot" />
                <span>SESSION INITIALIZATION GATEWAY</span>
              </div>
              <h1 className="login-heading">Sign In to INVENTRA</h1>
              <p className="login-subtext">
                Authenticate with your enterprise credentials to create an active operational session.
              </p>
            </div>

            {/* Quick Demo Role Picker */}
            <div className="demo-profiles-section">
              <label className="demo-label">Quick Demo Access (One-click session create):</label>
              <div className="demo-pills">
                <button
                  type="button"
                  className={`demo-pill ${activeRole === 'Admin' ? 'active' : ''}`}
                  onClick={() => handleDemoSelect('Admin', 'yash@inventra.internal', 'admin@123')}
                >
                  <UserCheck size={14} />
                  <span>Admin (Yash)</span>
                </button>
                <button
                  type="button"
                  className={`demo-pill ${activeRole === 'Manager' ? 'active' : ''}`}
                  onClick={() => handleDemoSelect('Manager', 'Garage.sharma@inventra.internal', 'manager@123')}
                >
                  <Warehouse size={14} />
                  <span>Manager (Gargee)</span>
                </button>
                <button
                  type="button"
                  className={`demo-pill ${activeRole === 'Auditor' ? 'active' : ''}`}
                  onClick={() => handleDemoSelect('Auditor', 'yash.audichya@inventra.internal', 'auditor@123')}
                >
                  <KeyRound size={14} />
                  <span>Auditor (Yash A.)</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-actual-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  Enterprise Work Email
                </label>
                <div className="input-with-icon">
                  <input
                    id="email-input"
                    type="email"
                    className="form-input"
                    placeholder="name@company.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="password-input">
                    Password / Access Key
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault()
                      openForgotModal()
                    }}
                    className="forgot-link"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="password-input-wrapper">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Persist session across browser restarts</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Creating Secure Session...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Establish Session & Enter Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="login-security-footer">
              <ShieldCheck size={14} className="security-icon" />
              <span>
                Authorized access only. Session tokens are generated and verified on local client memory.
              </span>
            </div>
          </div>
        </div>
      </div>

      {isForgotOpen && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal forgot-otp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password With OTP</h3>
              <button type="button" className="forgot-close-btn" onClick={closeForgotModal} aria-label="Close reset modal">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="forgot-steps">
                <span className={`forgot-step-chip ${forgotStep === 'email' ? 'active' : ''}`}>1. Request OTP</span>
                <span className={`forgot-step-chip ${forgotStep === 'otp' ? 'active' : ''}`}>2. Verify OTP</span>
                <span className={`forgot-step-chip ${forgotStep === 'reset' ? 'active' : ''}`}>3. New Password</span>
              </div>

              {forgotInfo && <div className="forgot-info-banner">{forgotInfo}</div>}
              {forgotError && <div className="login-error-alert forgot-error-banner"><AlertCircle size={14} /><span>{forgotError}</span></div>}

              {forgotStep === 'email' && (
                <form className="forgot-form" onSubmit={handleRequestOtp}>
                  <label className="form-label" htmlFor="forgot-email">Enterprise Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.internal"
                    required
                  />
                  <button type="submit" className="btn btn-primary forgot-submit-btn" disabled={forgotLoading}>
                    {forgotLoading ? 'Dispatching OTP...' : 'Request OTP'}
                  </button>
                </form>
              )}

              {forgotStep === 'otp' && (
                <form className="forgot-form" onSubmit={handleVerifyOtp}>
                  <label className="form-label" htmlFor="forgot-otp">One-Time Password</label>
                  <input
                    id="forgot-otp"
                    type="text"
                    className="form-input"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                  <div className="forgot-actions-row">
                    <button type="button" className="btn btn-secondary" onClick={() => setForgotStep('email')} disabled={forgotLoading}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary forgot-submit-btn" disabled={forgotLoading}>
                      {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'reset' && (
                <form className="forgot-form" onSubmit={handlePasswordReset}>
                  <label className="form-label" htmlFor="forgot-new-password">New Password</label>
                  <input
                    id="forgot-new-password"
                    type="password"
                    className="form-input"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />

                  <label className="form-label" htmlFor="forgot-confirm-password">Confirm Password</label>
                  <input
                    id="forgot-confirm-password"
                    type="password"
                    className="form-input"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={8}
                    required
                  />

                  <div className="forgot-actions-row">
                    <button type="button" className="btn btn-secondary" onClick={() => setForgotStep('otp')} disabled={forgotLoading}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary forgot-submit-btn" disabled={forgotLoading}>
                      {forgotLoading ? 'Updating...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'done' && (
                <div className="forgot-done-state">
                  <CheckCircle2 size={22} />
                  <p>Reset completed. Return to login and sign in with your updated password.</p>
                  <button type="button" className="btn btn-primary forgot-submit-btn" onClick={closeForgotModal}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
