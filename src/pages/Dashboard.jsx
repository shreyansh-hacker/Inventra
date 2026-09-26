import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  DollarSign, Package, AlertTriangle, XCircle, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, Activity, TrendingUp, TrendingDown,
  ChevronRight, ArrowRight, Plus, SlidersHorizontal, ClipboardCheck,
  Truck, Warehouse, MoveRight, PackageCheck, ShieldAlert, Clock,
  Ban, TriangleAlert, ShieldCheck, LogOut, KeyRound, UserCheck, RefreshCw,
  History, ArrowUpRight, ArrowDownLeft
} from 'lucide-react'
import api from '../services/api.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, destroySession } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [alertsList, setAlertsList] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [sumRes, healthRes, alertsRes, movRes] = await Promise.allSettled([
        api.dashboard.getSummary(),
        api.dashboard.getHealth(),
        api.alerts.getAll({ status: 'OPEN' }),
        api.dashboard.getMovements(5)
      ])

      if (sumRes.status === 'fulfilled' && sumRes.value?.success) {
        setSummary(sumRes.value.data)
      }
      if (healthRes.status === 'fulfilled' && healthRes.value?.success) {
        setHealthData(healthRes.value.data)
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value?.success) {
        setAlertsList(alertsRes.value.data || [])
      }
      if (movRes.status === 'fulfilled' && movRes.value?.success) {
        setRecentMovements(movRes.value.data || [])
      }
    } catch (err) {
      console.error('Error loading live dashboard metrics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleLogout = () => {
    destroySession()
    navigate('/login', { replace: true })
  }

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Operator'

  // Format currency in Lakhs or thousands
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '₹0'
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`
    }
    return `₹${Number(val).toLocaleString('en-IN')}`
  }

  // 5 Prominent Quick Actions
  const quickActions = [
    { label: 'New Receipt', icon: ArrowDownToLine, path: '/receipts' },
    { label: 'New Delivery', icon: ArrowUpFromLine, path: '/deliveries' },
    { label: 'New Internal Transfer', icon: ArrowLeftRight, path: '/transfers' },
    { label: 'Adjust Stock', icon: SlidersHorizontal, path: '/adjustments' },
    { label: 'Add Product', icon: Plus, path: '/products' },
  ]

  const kpis = [
    {
      label: 'Total Stock Value',
      value: formatCurrency(summary?.totalStockValue),
      sub: `${summary?.totalProducts || 0} active products`,
      icon: DollarSign,
      color: 'blue',
      trend: '+5.2%',
      trendDir: 'up',
      path: '/products'
    },
    {
      label: 'Total Units',
      value: (summary?.totalStock || 0).toLocaleString('en-IN'),
      sub: 'Company-wide across all locations',
      icon: Package,
      color: 'blue',
      trend: '+142',
      trendDir: 'up',
      path: '/products'
    },
    {
      label: 'Low / Risk Stock',
      value: String(summary?.lowStock || (healthData?.distribution?.RISK || 0)),
      sub: `${healthData?.distribution?.RISK || 0} items near reorder point`,
      icon: AlertTriangle,
      color: 'amber',
      trend: '',
      trendDir: 'neutral',
      path: '/alerts'
    },
    {
      label: 'Critical / Out of Stock',
      value: String(summary?.criticalStock || (healthData?.distribution?.CRITICAL || 0)),
      sub: `${summary?.outOfStock || 0} depleted products`,
      icon: XCircle,
      color: 'red',
      trend: '',
      trendDir: 'down',
      path: '/alerts'
    },
    {
      label: 'Pending Receipts',
      value: String(summary?.pendingReceipts || 0),
      sub: 'Inbound POs to receive',
      icon: ArrowDownToLine,
      color: 'blue',
      trend: '',
      trendDir: 'neutral',
      path: '/receipts'
    },
    {
      label: 'Pending Deliveries',
      value: String(summary?.pendingDeliveries || 0),
      sub: 'Outbound SOs awaiting dispatch',
      icon: ArrowUpFromLine,
      color: 'purple',
      trend: '',
      trendDir: 'neutral',
      path: '/deliveries'
    },
  ]

  const healthDist = healthData?.distribution || { HEALTHY: 8, RISK: 0, CRITICAL: 5, EXCESS: 0 }
  const totalHealth = (healthDist.HEALTHY || 0) + (healthDist.RISK || 0) + (healthDist.CRITICAL || 0) + (healthDist.EXCESS || 0) || 1
  const actionItems = healthData?.actionCenter || []

  const flowStages = [
    { label: 'Received', count: summary?.todaysMovements || 0, color: 'var(--success-50)', iconColor: 'var(--success-500)' },
    { label: 'Stored', count: summary?.totalStock || 0, color: 'var(--info-50)', iconColor: 'var(--info-500)' },
    { label: 'Reserved', count: 0, color: 'var(--warning-50)', iconColor: 'var(--warning-500)' },
    { label: 'Moving', count: summary?.activeTransfers || 0, color: '#f5f3ff', iconColor: '#8b5cf6' },
    { label: 'Delivered', count: summary?.pendingDeliveries || 0, color: 'var(--primary-50)', iconColor: 'var(--primary)' },
  ]

  return (
    <div>
      {/* 1. Dashboard Header */}
      <div className="session-status-banner">
        <div className="session-banner-left">
          <div className="session-live-indicator">
            <span className="pulse-dot" />
            <span className="session-badge-text">ACTIVE SESSION</span>
          </div>
          <div className="session-details-inline">
            <span className="session-id-tag">
              <KeyRound size={13} /> {session?.sessionId || 'SESS-ONLINE'}
            </span>
            <span className="session-divider">•</span>
            <span className="session-user-tag">
              <UserCheck size={13} /> {session?.user?.name || 'Administrator'} ({session?.user?.role || 'Full Access'})
            </span>
            <span className="session-divider">•</span>
            <span className="session-wh-tag">
              <Warehouse size={13} /> {session?.user?.warehouse || 'Central Hub'}
            </span>
          </div>
        </div>

        <div className="session-banner-right">
          <button 
            type="button" 
            className="btn btn-outline-danger btn-sm session-destroy-btn"
            onClick={handleLogout}
            title="Clear tokens and terminate current session"
          >
            <LogOut size={14} />
            <span>Destroy Session</span>
          </button>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-header-title">Good morning, {firstName} 👋</h1>
          <p className="page-header-subtitle">
            Authenticated as <strong>{session?.user?.role || 'Inventory Administrator'}</strong>. Real-time operational map and live stock custody:
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
        </button>
      </div>

      {/* 2. Quick Actions (Moved directly below header, above KPI cards) */}
      <div className="card mb-6" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-light)' }}>
        <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5) var(--space-3)' }}>
          <div className="card-title" style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>Quick Actions</div>
        </div>
        <div className="card-body" style={{ padding: '0 var(--space-5) var(--space-5)' }}>
          <div className="quick-actions-top-grid">
            {quickActions.map(action => (
              <div
                key={action.label}
                className="quick-action"
                onClick={() => navigate(action.path)}
                title={action.label}
              >
                <div className="quick-action-icon">
                  <action.icon size={20} />
                </div>
                <div className="quick-action-label">{action.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card" onClick={() => navigate(kpi.path)}>
            <div className="kpi-card-header">
              <div className={`kpi-card-icon ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              {kpi.trend && (
                <span className={`kpi-card-trend ${kpi.trendDir}`}>
                  {kpi.trendDir === 'up' && <TrendingUp size={12} />}
                  {kpi.trendDir === 'down' && <TrendingDown size={12} />}
                  {kpi.trend}
                </span>
              )}
            </div>
            <div className="kpi-card-value">{kpi.value}</div>
            <div className="kpi-card-label">{kpi.label}</div>
            <div className="kpi-card-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* 4. Receipt & Delivery Summary (Today's Inventory Flow) */}
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <div className="card-title">Receipt & Delivery Summary</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Today's inventory velocity & stock throughput
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/move-history')}>
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="card-body">
          <div className="flow-bar" style={{ border: 'none', padding: 0, boxShadow: 'none' }}>
            {flowStages.map((stage, i) => (
              <React.Fragment key={stage.label}>
                {i > 0 && (
                  <div className="flow-arrow">
                    <ArrowRight size={20} />
                  </div>
                )}
                <div className="flow-stage" onClick={() => navigate('/move-history')}>
                  <div
                    className="flow-stage-icon"
                    style={{ background: stage.color, color: stage.iconColor }}
                  >
                    {stage.label === 'Received' && <ArrowDownToLine size={18} />}
                    {stage.label === 'Stored' && <Warehouse size={18} />}
                    {stage.label === 'Reserved' && <Clock size={18} />}
                    {stage.label === 'Moving' && <MoveRight size={18} />}
                    {stage.label === 'Delivered' && <PackageCheck size={18} />}
                  </div>
                  <div className="flow-stage-count">{stage.count}</div>
                  <div className="flow-stage-label">{stage.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: 5. Inventory/Stock Overview & 6. Recent Operations / Activity */}
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* 5. Inventory/Stock Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Inventory Health & Stock Overview</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Stock health distribution and automated reorder buffers
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/products')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body">
            <div className="health-bar">
              <div className="health-bar-segment healthy" style={{ width: `${((healthDist.HEALTHY || 0) / totalHealth) * 100}%` }}>{healthDist.HEALTHY || 0}</div>
              <div className="health-bar-segment watch" style={{ width: `${((healthDist.RISK || 0) / totalHealth) * 100}%` }}>{healthDist.RISK || 0}</div>
              <div className="health-bar-segment critical" style={{ width: `${((healthDist.CRITICAL || 0) / totalHealth) * 100}%` }}>{healthDist.CRITICAL || 0}</div>
              <div className="health-bar-segment overstock" style={{ width: `${((healthDist.EXCESS || 0) / totalHealth) * 100}%` }}>{healthDist.EXCESS || 0}</div>
            </div>
            <div className="health-legend">
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-healthy)' }} /> Healthy ({healthDist.HEALTHY || 0})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-watch)' }} /> Risk / Watch ({healthDist.RISK || 0})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-critical)' }} /> Critical ({healthDist.CRITICAL || 0})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-overstock)' }} /> Excess ({healthDist.EXCESS || 0})</div>
            </div>

            <div style={{ marginTop: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Action Center (Needs Attention)</div>
              {actionItems.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                  ✅ All inventory levels are optimal across all warehouses.
                </div>
              ) : (
                actionItems.slice(0, 4).map(item => (
                  <div key={item.id} className="priority-item" onClick={() => navigate(`/products/${item.productId}`)}>
                    <div className={`priority-icon ${item.severity === 'critical' ? 'critical' : 'warning'}`}>
                      {item.severity === 'critical' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="priority-content">
                      <div className="priority-title">{item.product}</div>
                      <div className="priority-desc">
                        {item.available} available · {item.dailyUsage} · {item.daysRemaining} days left
                      </div>
                    </div>
                    <span className={`badge badge-${item.severity === 'critical' ? 'critical' : 'low'}`}>
                      <span className="badge-dot" />
                      {item.severity ? item.severity.toUpperCase() : 'ALERT'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 6. Recent Operations / Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Priority Queue (Live Alerts) */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Priority Queue (Live Alerts)</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {alertsList.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                  No open operational alerts at this time.
                </div>
              ) : (
                alertsList.slice(0, 3).map(alert => (
                  <div key={alert.id} className="priority-item" onClick={() => navigate('/alerts')}>
                    <div className={`priority-icon ${alert.severity === 'CRITICAL' || alert.type === 'critical' ? 'critical' : 'warning'}`}>
                      {(alert.severity === 'CRITICAL' || alert.type === 'critical') && <Ban size={14} />}
                      {(alert.severity === 'WARNING' || alert.type === 'warning') && <TriangleAlert size={14} />}
                      {(alert.severity === 'INFO' || alert.type === 'info') && <Activity size={14} />}
                    </div>
                    <div className="priority-content">
                      <div className="priority-title">{alert.title}</div>
                      <div className="priority-desc">{(alert.message || alert.desc || alert.description || '').split('.')[0]}.</div>
                      <div className="priority-action">
                        <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); navigate('/receipts'); }}>
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Operations & Movements Feed */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">Recent Operations & Movements</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/move-history')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentMovements.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                  No recent movements recorded today.
                </div>
              ) : (
                recentMovements.slice(0, 4).map(m => (
                  <div key={m.id} className="priority-item" onClick={() => navigate('/move-history')}>
                    <div className="priority-icon" style={{
                      background: m.operation === 'RECEIPT' || m.operation === 'Receipt' ? 'var(--success-50)' :
                        m.operation === 'DELIVERY' || m.operation === 'Delivery' ? 'var(--primary-50)' : 'var(--warning-50)',
                      color: m.operation === 'RECEIPT' || m.operation === 'Receipt' ? 'var(--success-600)' :
                        m.operation === 'DELIVERY' || m.operation === 'Delivery' ? 'var(--primary-600)' : 'var(--warning-600)'
                    }}>
                      {m.operation === 'RECEIPT' || m.operation === 'Receipt' ? <ArrowDownLeft size={14} /> :
                        m.operation === 'DELIVERY' || m.operation === 'Delivery' ? <ArrowUpRight size={14} /> : <ArrowLeftRight size={14} />}
                    </div>
                    <div className="priority-content">
                      <div className="priority-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{m.product}</span>
                        <span className="font-semibold" style={{
                          fontSize: 'var(--font-xs)',
                          color: String(m.quantity).startsWith('+') ? 'var(--success-600)' : String(m.quantity).startsWith('-') ? 'var(--danger-600)' : 'inherit'
                        }}>
                          {m.quantity}
                        </span>
                      </div>
                      <div className="priority-desc">
                        {m.reference} · {m.from} → {m.to}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
