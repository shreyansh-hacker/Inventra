import React, { useState } from 'react'
import { Search, Plus, SlidersHorizontal, Check, AlertTriangle } from 'lucide-react'
import { adjustments } from '../data/demoData.js'

const statusLabels = { applied: 'Applied', pending: 'Pending', canceled: 'Canceled' }

export default function Adjustments() {
  const [search, setSearch] = useState('')

  const filtered = adjustments.filter(a =>
    a.reference.toLowerCase().includes(search.toLowerCase()) ||
    a.product.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Stock Adjustments</h1>
            <p className="page-header-subtitle">Reconcile system quantities with physical counts</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary"><Plus size={16} /> New Adjustment</button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search adjustments..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filtered.map(a => (
          <div key={a.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', fontFamily: 'monospace' }}>{a.reference}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{a.product} · {a.location} · {a.responsible}</div>
                </div>
                <span className={`badge badge-${a.status === 'applied' ? 'done' : a.status === 'pending' ? 'watch' : 'canceled'}`}>
                  <span className="badge-dot" />
                  {statusLabels[a.status]}
                </span>
              </div>

              <div className="adjustment-compare">
                <div className="adjustment-value">
                  <div className="adjustment-value-label">System Qty</div>
                  <div className="adjustment-value-number">{a.systemQty}</div>
                </div>
                <div className="adjustment-vs">vs</div>
                <div className="adjustment-value">
                  <div className="adjustment-value-label">Physical Count</div>
                  <div className="adjustment-value-number">{a.countedQty}</div>
                </div>
                <div className="adjustment-vs">=</div>
                <div className="adjustment-value">
                  <div className="adjustment-value-label">Difference</div>
                  <div className={`adjustment-value-number ${a.difference < 0 ? 'negative' : ''}`}
                    style={{ color: a.difference > 0 ? 'var(--success-600)' : a.difference < 0 ? 'var(--danger-600)' : 'var(--text-tertiary)' }}>
                    {a.difference > 0 ? '+' : ''}{a.difference}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
                <span>Reason: <strong style={{ color: 'var(--text-primary)' }}>{a.reason}</strong></span>
                <span>{a.createdAt}</span>
              </div>
              {a.notes && (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>{a.notes}</div>
              )}
              {a.status === 'pending' && (
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-success btn-sm"><Check size={12} /> Approve</button>
                  <button className="btn btn-danger btn-sm">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
