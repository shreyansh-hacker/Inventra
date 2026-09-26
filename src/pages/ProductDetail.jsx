import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, QrCode, Edit, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react'
import api from '../services/api.js'

const healthLabels = {
  healthy: 'Healthy',
  risk: 'Watch / Risk',
  watch: 'Watch / Risk',
  low: 'Low',
  critical: 'Critical',
  overstock: 'Overstock',
  excess: 'Excess'
}

const journeyDotClass = {
  receipt: 'receipt',
  stored: 'stored',
  moved: 'moved',
  transfer: 'moved',
  reserved: 'reserved',
  delivered: 'delivered',
  delivery: 'delivered',
  adjusted: 'adjusted',
  adjustment: 'adjusted'
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [product, setProduct] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadProductData = async () => {
    try {
      const [prodRes, ledgerRes] = await Promise.allSettled([
        api.products.getById(id),
        api.ledger.get({ productId: id })
      ])

      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProduct(prodRes.value.data)
      }
      if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.success) {
        setLedgerEntries(ledgerRes.value.data || [])
      }
    } catch (err) {
      console.error('Failed to load product detail:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProductData()
  }, [id])

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading product information from MySQL...
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>The requested product does not exist or has been archived.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    )
  }

  const journey = product.journey || []
  const locations = product.locations || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/products')} style={{ marginLeft: '-8px' }}>
          <ArrowLeft size={16} /> Back to Products
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadProductData(); }} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Refresh Stock</span>
        </button>
      </div>

      <div className="detail-header">
        <div className="detail-title-section">
          <div className="detail-icon"><Package size={24} /></div>
          <div>
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-ref">{product.sku} {product.barcode ? `· ${product.barcode}` : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className={`badge badge-${product.health === 'risk' ? 'watch' : product.health === 'excess' ? 'overstock' : product.health}`}>
            <span className="badge-dot" />
            {healthLabels[product.health] || product.health}
          </span>
        </div>
      </div>

      <div className="detail-stats">
        <div className="detail-stat">
          <div className="detail-stat-value">{product.onHand}</div>
          <div className="detail-stat-label">On Hand ({product.unit})</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{product.reserved}</div>
          <div className="detail-stat-label">Reserved ({product.unit})</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value" style={{ color: product.available <= product.reorderPoint ? 'var(--danger-600)' : 'var(--success-600)' }}>
            {product.available}
          </div>
          <div className="detail-stat-label">Available ({product.unit})</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{product.damaged}</div>
          <div className="detail-stat-label">Damaged ({product.unit})</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{product.reorderPoint}</div>
          <div className="detail-stat-label">Reorder Safety Point</div>
        </div>
      </div>

      {/* Health / Alert Explanation */}
      {product.healthReason && (
        <div style={{
          padding: 'var(--space-4)',
          background: product.health === 'critical' ? 'var(--danger-50)' : product.health === 'risk' ? 'var(--warning-50)' : 'var(--success-50)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
          border: `1px solid ${product.health === 'critical' ? 'var(--danger-100)' : product.health === 'risk' ? 'var(--warning-100)' : 'var(--success-100)'}`
        }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: product.health === 'critical' ? 'var(--danger-700)' : product.health === 'risk' ? 'var(--warning-700)' : 'var(--success-700)', marginBottom: '4px' }}>
            Health Assessment: {healthLabels[product.health] || product.health}
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: product.health === 'critical' ? 'var(--danger-600)' : product.health === 'risk' ? 'var(--warning-600)' : 'var(--success-600)' }}>
            {product.healthReason}
            {product.recommendedAction && <strong> Action: {product.recommendedAction}</strong>}
          </div>
        </div>
      )}

      <div className="tabs">
        {['overview', 'locations', 'journey', 'ledger'].map(tab => (
          <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><div className="card-title">Product Details</div></div>
            <div className="card-body">
              {[
                ['Category', product.category],
                ['Unit of Measure', product.unit],
                ['Cost', `₹${product.cost}`],
                ['Selling Price', `₹${product.sellingPrice}`],
                ['Min Buffer Stock', `${product.minStock} ${product.unit}`],
                ['Max Warehouse Capacity', `${product.maxStock} ${product.unit}`],
                ['Reorder Safety Point', `${product.reorderPoint} ${product.unit}`],
                ['Supplier', product.supplier || 'Direct Sourced'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 'var(--font-sm)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Digital Stock Custody DNA</div></div>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', background: 'var(--surface-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                <QrCode size={64} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                {product.sku} / {product.warehouseId} / {product.location?.split(' / ').pop()}
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                Scan to verify physical custody & bin placement
              </div>
              <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', textAlign: 'left' }}>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Available Stock</div>
                  <div style={{ fontWeight: 600 }}>{product.available} {product.unit}</div>
                </div>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Primary Location</div>
                  <div style={{ fontWeight: 600 }}>{product.location?.split(' / ').pop() || 'General'}</div>
                </div>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Reorder Point</div>
                  <div style={{ fontWeight: 600 }}>{product.reorderPoint} {product.unit}</div>
                </div>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Status</div>
                  <div style={{ fontWeight: 600 }}>{healthLabels[product.health] || product.health}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Product Stock Journey (Audit Timeline)</div></div>
          <div className="card-body">
            {journey.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No stock transactions recorded yet for this product.
              </div>
            ) : (
              <div className="journey-timeline">
                {journey.map((event, i) => (
                  <div className="journey-event" key={event.id || i}>
                    <div className={`journey-event-dot ${journeyDotClass[event.type] || 'stored'}`} />
                    <div className="journey-event-content">
                      <div className="journey-event-header">
                        <div className="journey-event-title">{event.title}</div>
                        <div className="journey-event-time">
                          {event.time ? new Date(event.time).toLocaleString() : ''}
                        </div>
                      </div>
                      <div className="journey-event-detail">
                        <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        {event.location} · {event.reference} · By {event.user}
                      </div>
                      {event.notes && (
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          {event.notes}
                        </div>
                      )}
                      <div className="journey-event-qty" style={{
                        color: String(event.quantity).startsWith('+') ? 'var(--success-600)' : String(event.quantity).startsWith('-') ? 'var(--danger-600)' : 'var(--text-primary)'
                      }}>
                        {event.quantity} (Running Total: {event.runningBalance})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Stock Locations Breakdown</div></div>
          <div className="card-body">
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Warehouse & Location</th>
                    <th>Bin Code</th>
                    <th className="text-right">On Hand</th>
                    <th className="text-right">Reserved</th>
                    <th className="text-right">Available</th>
                    <th className="text-right">Damaged</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No specific bin inventory allocated.
                      </td>
                    </tr>
                  ) : (
                    locations.map(loc => (
                      <tr key={loc.locationId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
                            <span>{loc.warehouseName} ({loc.warehouseCode}) — Zone {loc.zone} / Rack {loc.rack} / Shelf {loc.shelf}</span>
                          </div>
                        </td>
                        <td><span className="text-mono">{loc.code || loc.bin}</span></td>
                        <td className="text-right font-semibold">{loc.onHand} {product.unit}</td>
                        <td className="text-right">{loc.reserved} {product.unit}</td>
                        <td className="text-right font-semibold">{loc.available} {product.unit}</td>
                        <td className="text-right" style={{ color: loc.damaged > 0 ? 'var(--danger-600)' : 'inherit' }}>
                          {loc.damaged} {product.unit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Immutable Stock Ledger</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Warehouse / Location</th>
                    <th>Operation</th>
                    <th className="text-right">Before</th>
                    <th className="text-right">Change</th>
                    <th className="text-right">After</th>
                    <th>Reference</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ fontSize: 'var(--font-xs)', fontFamily: 'monospace' }}>
                        {entry.time ? new Date(entry.time).toLocaleString() : new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td>{entry.location || entry.locationName || 'Central Storage'}</td>
                      <td>
                        <span className={`badge badge-${entry.type === 'RECEIPT' ? 'healthy' : entry.type === 'ADJUSTMENT' ? 'critical' : 'watch'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="text-right">{entry.beforeBalance ?? entry.before ?? '—'}</td>
                      <td className={`text-right font-semibold ${entry.quantity > 0 ? 'amount-positive' : 'amount-negative'}`}>
                        {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                      </td>
                      <td className="text-right font-semibold">{entry.afterBalance ?? entry.after ?? '—'}</td>
                      <td className="text-mono">{entry.referenceNumber || entry.reference}</td>
                      <td style={{ fontSize: 'var(--font-xs)' }}>{entry.createdByName || entry.user || 'System'}</td>
                    </tr>
                  ))}
                  {ledgerEntries.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                        No ledger transactions recorded for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
