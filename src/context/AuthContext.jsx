import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const SESSION_STORAGE_KEY = 'inventra_session'
const LOCAL_STORAGE_KEY = 'inventra_session_remembered'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to parse existing session:', e)
    }
    return null
  })

  // Create new session
  const createSession = ({ email, name, role = 'Inventory Administrator', rememberMe = false }) => {
    const displayName = name || (email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Yash Rathore')
    const initials = displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    const newSession = {
      sessionId: 'SESS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      token: 'inv_tok_' + Math.random().toString(36).substring(2, 14),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours validity
      rememberMe: !!rememberMe,
      user: {
        name: displayName,
        email: email || 'yash@inventra.internal',
        role: role,
        initials: initials || 'YR',
        warehouse: 'Central Warehouse (Hub 1)',
        ip: '192.168.1.108',
      }
    }

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession))
      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession))
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    } catch (err) {
      console.error('Failed to save session:', err)
    }

    setSession(newSession)
    return newSession
  }

  // Destroy session
  const destroySession = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear session:', err)
    }
    setSession(null)
  }

  // Listen for storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === SESSION_STORAGE_KEY || e.key === LOCAL_STORAGE_KEY) {
        try {
          const updated = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(LOCAL_STORAGE_KEY)
          setSession(updated ? JSON.parse(updated) : null)
        } catch {
          setSession(null)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        createSession,
        destroySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
