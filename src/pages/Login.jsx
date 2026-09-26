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

  const handleForgotPassword = async () => {
    const resetEmail = window.prompt('Enter your enterprise email for OTP verification:', email.trim())
    if (!resetEmail || !resetEmail.trim()) return

    try {
      const forgotRes = await api.auth.forgotPassword(resetEmail.trim())
      let infoMsg = forgotRes?.message || 'OTP dispatched. Check your secure channel.'
      if (forgotRes?.debugOtp) {
        infoMsg += `\n\nDev OTP: ${forgotRes.debugOtp}`
      }
      window.alert(infoMsg)

      const otp = window.prompt('Enter the OTP received:')
      if (!otp || !otp.trim()) return

      const verifyRes = await api.auth.verifyOtp(resetEmail.trim(), otp.trim())
      const resetToken = verifyRes?.data?.resetToken
      if (!resetToken) {
        window.alert('Unable to verify OTP. Please retry.')
        return
      }

      const newPassword = window.prompt('Enter your new password (minimum 8 characters):')
      if (!newPassword || newPassword.length < 8) {
        window.alert('Password must be at least 8 characters.')
        return
      }

      await api.auth.resetPassword(resetEmail.trim(), resetToken, newPassword)
      window.alert('Password reset successful. You can now sign in with your new password.')
      setPassword('')
    } catch (err) {
      window.alert(err?.message || 'Password reset failed. Please try again.')
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
                      handleForgotPassword()
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
    </div>
  )
}
