// INVENTRA Frontend API Client
// Handles communication with Node/Express + Prisma backend

const API_BASE = '/api'

function getAuthHeader() {
  try {
    const sessionStr = sessionStorage.getItem('inventra_session') || localStorage.getItem('inventra_session_remembered')
    if (sessionStr) {
      const session = JSON.parse(sessionStr)
      if (session && session.token) {
        return { Authorization: `Bearer ${session.token}` }
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return {}
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.details = data?.details
    throw error
  }

  return data
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
    resetPassword: (email, resetToken, newPassword) => request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword })
    }),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request('/dashboard/summary'),
    getHealth: () => request('/dashboard/health'),
    getAlerts: () => request('/dashboard/alerts'),
    getMovements: (limit = 10) => request(`/dashboard/movements?limit=${limit}`),
    getLocationHealth: () => request('/dashboard/location-health'),
  },

  // Products & Catalog
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/products${query ? `?${query}` : ''}`)
    },
    getById: (id) => request(`/products/${id}`),
    getLocations: (id) => request(`/products/${id}/locations`),
    getJourney: (id) => request(`/products/${id}/journey`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Receipts (Inbound)
  receipts: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/receipts${query ? `?${query}` : ''}`)
    },
    getById: (id) => request(`/receipts/${id}`),
    create: (data) => request('/receipts', { method: 'POST', body: JSON.stringify(data) }),
    validate: (id, data = {}) => request(`/receipts/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id) => request(`/receipts/${id}/cancel`, { method: 'POST' }),
  },

  // Deliveries (Outbound)
  deliveries: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/deliveries${query ? `?${query}` : ''}`)
    },
    getById: (id) => request(`/deliveries/${id}`),
    create: (data) => request('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
    validate: (id, data = {}) => request(`/deliveries/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id) => request(`/deliveries/${id}/cancel`, { method: 'POST' }),
  },

  // Internal Transfers & Smart Suggestions
  transfers: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/transfers${query ? `?${query}` : ''}`)
    },
    getById: (id) => request(`/transfers/${id}`),
    create: (data) => request('/transfers', { method: 'POST', body: JSON.stringify(data) }),
    validate: (id, data = {}) => request(`/transfers/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
    getSuggestions: () => request('/transfers/suggestions'),
    approveSuggestion: (data) => request('/transfers/suggestions/approve', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Stock Adjustments (Physical counts, damages, corrections)
  adjustments: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/adjustments${query ? `?${query}` : ''}`)
    },
    getById: (id) => request(`/adjustments/${id}`),
    create: (data) => request('/adjustments', { method: 'POST', body: JSON.stringify(data) }),
    apply: (id, data = {}) => request(`/adjustments/${id}/apply`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Stock Ledger & Movements
  ledger: {
    get: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/ledger${query ? `?${query}` : ''}`)
    },
  },
  movements: {
    get: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/movements${query ? `?${query}` : ''}`)
    },
  },

  // Warehouses & Locations
  warehouses: {
    getAll: () => request('/warehouses'),
    getById: (id) => request(`/warehouses/${id}`),
    getZones: (id) => request(`/warehouses/${id}/zones`),
  },

  // Interactive Inventory Map
  inventoryMap: {
    get: () => request('/inventory-map'),
  },

  // Operational Alerts
  alerts: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/alerts${query ? `?${query}` : ''}`)
    },
    resolve: (id) => request(`/alerts/${id}/resolve`, { method: 'POST' }),
    snooze: (id, hours = 24) => request(`/alerts/${id}/snooze`, { method: 'POST', body: JSON.stringify({ hours }) }),
  },

  // Global Omnisearch
  search: {
    query: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  }
}

export default api
