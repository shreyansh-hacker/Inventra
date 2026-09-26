import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  DollarSign, Package, AlertTriangle, XCircle, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, Activity, TrendingUp, TrendingDown,
  ChevronRight, ArrowRight, Plus, SlidersHorizontal, ClipboardCheck,
  Truck, Warehouse, MoveRight, PackageCheck, ShieldAlert, Clock,
  Ban, TriangleAlert, ShieldCheck, LogOut, KeyRound, UserCheck
} from 'lucide-react'
import { dashboardMetrics, healthDistribution, flowData, products, alerts } from '../data/demoData.js'

const kpis = [
  { label: 'Total Stock Value', value: '₹28.47L', sub: 'Across 2 warehouses', icon: DollarSign, color: 'blue', trend: '+5.2%', trendDir: 'up', path: '/products' },
  { label: 'Total Units', value: '4,356', sub: '12 active products', icon: Package, color: 'blue', trend: '+142', trendDir: 'up', path: '/products' },
  { label: 'Low Stock', value: '4', sub: '2 critical items', icon: AlertTriangle, color: 'amber', trend: '+1', trendDir: 'down', path: '/alerts' },
  { label: 'Out of Stock', value: '1', sub: 'PVC Pipe (4 inch)', icon: XCircle, color: 'red', trend: '0', trendDir: 'neutral', path: '/alerts' },
  { label: 'Pending Receipts', value: '2', sub: 'Expected this week', icon: ArrowDownToLine, color: 'blue', trend: '', trendDir: 'neutral', path: '/receipts' },
  { label: 'Pending Deliveries', value: '3', sub: '1 in picking stage', icon: ArrowUpFromLine, color: 'purple', trend: '', trendDir: 'neutral', path: '/deliveries' },
]

const flowStages = [
  { label: 'Received', count: flowData.received, color: 'var(--success-50)', iconColor: 'var(--success-500)' },
  { label: 'Stored', count: flowData.stored, color: 'var(--info-50)', iconColor: 'var(--info-500)' },
  { label: 'Reserved', count: flowData.reserved, color: 'var(--warning-50)', iconColor: 'var(--warning-500)' },
  { label: 'Moving', count: flowData.moving, color: '#f5f3ff', iconColor: '#8b5cf6' },
  { label: 'Delivered', count: flowData.delivered, color: 'var(--primary-50)', iconColor: 'var(--primary)' },
]

const quickActions = [
  { label: 'Receive Stock', icon: ArrowDownToLine, path: '/receipts' },
  { label: 'Create Delivery', icon: ArrowUpFromLine, path: '/deliveries' },
  { label: 'Move Stock', icon: ArrowLeftRight, path: '/transfers' },
  { label: 'Adjust Stock', icon: SlidersHorizontal, path: '/adjustments' },
  { label: 'Add Product', icon: Plus, path: '/products' },
  { label: 'Stock Count', icon: ClipboardCheck, path: '/stock-count' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, destroySession } = useAuth()
  const totalHealth = healthDistribution.healthy + healthDistribution.watch + healthDistribution.low + healthDistribution.critical + healthDistribution.overstock
  const needsAttention = products.filter(p => p.health === 'critical' || p.health === 'low')

  const handleLogout = () => {
    destroySession()
    navigate('/login', { replace: true })
  }

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Operator'

  return (
    <div>
      {/* Active Operational Session Status Banner */}
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

      {/* Greeting */}
      <div className="page-header" style={{ marginTop: 'var(--space-4)' }}>
        <div>
          <h1 className="page-header-title">Good morning, {firstName} 👋</h1>
          <p className="page-header-subtitle">
            Authenticated as <strong>{session?.user?.role || 'Inventory Administrator'}</strong>. Live operational status across all warehouse bins:
          </p>
        </div>
      </div>

      {/* KPI Grid */}
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

      {/* Inventory Flow Timeline */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="card-title">Today's Inventory Flow</div>
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

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Inventory Health */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Inventory Health</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/products')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body">
            <div className="health-bar">
              <div className="health-bar-segment healthy" style={{ width: `${(healthDistribution.healthy / totalHealth) * 100}%` }}>{healthDistribution.healthy}</div>
              <div className="health-bar-segment watch" style={{ width: `${(healthDistribution.watch / totalHealth) * 100}%` }}>{healthDistribution.watch}</div>
              <div className="health-bar-segment low" style={{ width: `${(healthDistribution.low / totalHealth) * 100}%` }}>{healthDistribution.low}</div>
              <div className="health-bar-segment critical" style={{ width: `${(healthDistribution.critical / totalHealth) * 100}%` }}>{healthDistribution.critical}</div>
              <div className="health-bar-segment overstock" style={{ width: `${(healthDistribution.overstock / totalHealth) * 100}%` }}>{healthDistribution.overstock}</div>
            </div>
            <div className="health-legend">
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-healthy)' }} /> Healthy ({healthDistribution.healthy})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-watch)' }} /> Watch ({healthDistribution.watch})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-low)' }} /> Low ({healthDistribution.low})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-critical)' }} /> Critical ({healthDistribution.critical})</div>
              <div className="health-legend-item"><div className="health-legend-dot" style={{ background: 'var(--health-overstock)' }} /> Overstock ({healthDistribution.overstock})</div>
            </div>

            <div style={{ marginTop: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Needs Attention</div>
              {needsAttention.map(p => (
                <div key={p.id} className="priority-item" onClick={() => navigate(`/products/${p.id}`)}>
                  <div className={`priority-icon ${p.health === 'critical' ? 'critical' : 'warning'}`}>
                    {p.health === 'critical' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="priority-content">
                    <div className="priority-title">{p.name}</div>
                    <div className="priority-desc">
                      {p.available} {p.unit} available · Reorder at {p.reorderPoint} {p.unit}
                    </div>
                  </div>
                  <span className={`badge badge-${p.health}`}>
                    <span className="badge-dot" />
                    {p.health.charAt(0).toUpperCase() + p.health.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Queue + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Priority Queue */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">Priority Queue</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="priority-item" onClick={() => navigate('/alerts')}>
                  <div className={`priority-icon ${alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'warning' : 'info'}`}>
                    {alert.type === 'critical' && <Ban size={14} />}
                    {alert.type === 'warning' && <TriangleAlert size={14} />}
                    {alert.type === 'info' && <Activity size={14} />}
                  </div>
                  <div className="priority-content">
                    <div className="priority-title">{alert.title}</div>
                    <div className="priority-desc">{alert.desc.split('.')[0]}.</div>
                    <div className="priority-action">
                      <button className="btn btn-sm btn-secondary">{alert.action}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                {quickActions.map(action => (
                  <div key={action.label} className="quick-action" onClick={() => navigate(action.path)}>
                    <div className="quick-action-icon">
                      <action.icon size={20} />
                    </div>
                    <div className="quick-action-label">{action.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
