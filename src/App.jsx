import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import SearchModal from './components/SearchModal.jsx'

// Pages
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import InventoryMap from './pages/InventoryMap.jsx'
import StockCount from './pages/StockCount.jsx'
import Receipts from './pages/Receipts.jsx'
import ReceiptDetail from './pages/ReceiptDetail.jsx'
import Deliveries from './pages/Deliveries.jsx'
import DeliveryDetail from './pages/DeliveryDetail.jsx'
import Transfers from './pages/Transfers.jsx'
import Adjustments from './pages/Adjustments.jsx'
import MoveHistory from './pages/MoveHistory.jsx'
import StockLedger from './pages/StockLedger.jsx'
import Alerts from './pages/Alerts.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Layout wrapper for authenticated operational screens
function AppLayout({ children, collapsed, setCollapsed }) {
  const [searchOpen, setSearchOpen] = useState(false)

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`main-wrapper${collapsed ? ' sidebar-collapsed' : ''}`}>
        <TopBar collapsed={collapsed} onSearchOpen={() => setSearchOpen(true)} />
        <main className="main-content">
          {children}
        </main>
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function AppRoutes() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Routes>
      {/* Separate Dedicated Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (connected directly to Dashboard & operations) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout collapsed={collapsed} setCollapsed={setCollapsed}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/inventory-map" element={<InventoryMap />} />
                <Route path="/stock-count" element={<StockCount />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/receipts/:id" element={<ReceiptDetail />} />
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/deliveries/:id" element={<DeliveryDetail />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/adjustments" element={<Adjustments />} />
                <Route path="/move-history" element={<MoveHistory />} />
                <Route path="/stock-ledger" element={<StockLedger />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}
