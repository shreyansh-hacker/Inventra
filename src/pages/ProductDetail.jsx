import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, QrCode, Edit } from 'lucide-react'
import { products, steelRodJourney, stockLedger } from '../data/demoData.js'

const healthLabels = { healthy: 'Healthy', watch: 'Watch', low: 'Low', critical: 'Critical', overstock: 'Overstock' }
const journeyDotClass = { receipt: 'receipt', stored: 'stored', moved: 'moved', reserved: 'reserved', delivered: 'delivered', adjusted: 'adjusted' }

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const product = products.find(p => p.id === id) || products[0]
  const productLedger = stockLedger.filter(s => s.productId === product.id)
  const journey = product.id === 'PRD01' ? steelRodJourney : steelRodJourney.slice(0, 3)

  return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/products')} style={{ marginLeft: '-8px' }}>
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div className="detail-header">
        <div className="detail-title-section">
          <div className="detail-icon"><Package size={24} /></div>
          <div>
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-ref">{product.sku} · {product.barcode}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className={`badge badge-${product.health}`}>
            <span className="badge-dot" />
            {healthLabels[product.health]}
          </span>
          <button className="btn btn-secondary"><Edit size={14} /> Edit</button>
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
          <div className="detail-stat-value" style={{ color: product.available <= product.reorderPoint ? 'var(--danger-600)' : 'var(--success-600)' }}>{product.available}</div>
          <div className="detail-stat-label">Available ({product.unit})</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{product.damaged}</div>
          <div className="detail-stat-label">Damaged ({product.unit})</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{product.reorderPoint}</div>
          <div className="detail-stat-label">Reorder Point</div>
        </div>
      </div>

      {/* Health explanation */}
      {(product.health === 'critical' || product.health === 'low') && (
        <div style={{ padding: 'var(--space-4)', background: product.health === 'critical' ? 'var(--danger-50)' : 'var(--warning-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', border: `1px solid ${product.health === 'critical' ? 'var(--danger-100)' : 'var(--warning-100)'}` }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: product.health === 'critical' ? 'var(--danger-700)' : 'var(--warning-700)', marginBottom: '4px' }}>
            {product.name}: {healthLabels[product.health]}
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: product.health === 'critical' ? 'var(--danger-600)' : 'var(--warning-600)' }}>
            Available stock: {product.available} {product.unit} · Reorder point: {product.reorderPoint} {product.unit}
            {product.health === 'critical' && ` · Immediate replenishment recommended.`}
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
                ['Min Stock', product.minStock],
                ['Max Stock', product.maxStock],
                ['Supplier', product.supplier],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 'var(--font-sm)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Digital Stock DNA</div></div>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', background: 'var(--surface-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                <QrCode size={64} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                {product.sku} / {product.warehouseId} / {product.location.split(' / ').pop()}
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                Scan to view real-time stock info
              </div>
              <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', textAlign: 'left' }}>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Quantity</div>
                  <div style={{ fontWeight: 600 }}>{product.onHand} {product.unit}</div>
                </div>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>{product.location.split(' / ').pop()}</div>
                </div>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Last Move</div>
                  <div style={{ fontWeight: 600 }}>{product.lastMovement.split(' ')[1]}</div>
                </div>
                <div style={{ padding: 'var(--space-2)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>Health</div>
                  <div style={{ fontWeight: 600 }}>{healthLabels[product.health]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Stock Journey</div></div>
          <div className="card-body">
            <div className="journey-timeline">
              {journey.map((event, i) => (
                <div className="journey-event" key={i}>
                  <div className={`journey-event-dot ${journeyDotClass[event.type]}`} />
                  <div className="journey-event-content">
                    <div className="journey-event-header">
                      <div className="journey-event-title">{event.title}</div>
                      <div className="journey-event-time">{event.time}</div>
                    </div>
                    <div className="journey-event-detail">
                      <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {event.location} · {event.ref} · {event.user}
                    </div>
                    <div className="journey-event-qty" style={{ color: event.qty.startsWith('+') ? 'var(--success-600)' : event.qty.startsWith('-') ? 'var(--danger-600)' : 'var(--text-primary)' }}>
                      {event.qty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Stock Locations</div></div>
          <div className="card-body">
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Location</th><th className="text-right">Quantity</th><th className="text-right">Reserved</th><th className="text-right">Available</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />{product.location}</div></td>
                    <td className="text-right font-semibold">{product.onHand} {product.unit}</td>
                    <td className="text-right">{product.reserved} {product.unit}</td>
                    <td className="text-right font-semibold">{product.available} {product.unit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Stock Ledger</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Time</th><th>Location</th><th>Movement</th><th className="text-right">Before</th><th className="text-right">Change</th><th className="text-right">After</th><th>Reference</th></tr>
                </thead>
                <tbody>
                  {productLedger.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ fontSize: 'var(--font-xs)', fontFamily: 'monospace' }}>{entry.time}</td>
                      <td>{entry.location}</td>
                      <td><span className={`badge badge-${entry.movement === 'Receipt' || entry.movement === 'Transfer In' ? 'healthy' : entry.movement === 'Adjustment' ? 'critical' : 'watch'}`}>{entry.movement}</span></td>
                      <td className="text-right">{entry.before}</td>
                      <td className={`text-right font-semibold ${entry.change > 0 ? 'amount-positive' : 'amount-negative'}`}>{entry.change > 0 ? `+${entry.change}` : entry.change}</td>
                      <td className="text-right font-semibold">{entry.after}</td>
                      <td className="text-mono">{entry.reference}</td>
                    </tr>
                  ))}
                  {productLedger.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No ledger entries found for this product.</td></tr>
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
