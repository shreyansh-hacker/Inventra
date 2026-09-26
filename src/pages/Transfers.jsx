import React, { useState } from 'react'
import { Search, Plus, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { transfers } from '../data/demoData.js'

const statusLabels = { pending: 'Pending', moving: 'Moving', done: 'Done', canceled: 'Canceled' }

export default function Transfers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = transfers.filter(t => {
    const matchSearch = t.reference.toLowerCase().includes(search.toLowerCase()) || t.product.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Internal Transfers</h1>
            <p className="page-header-subtitle">Move inventory between locations</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary"><Plus size={16} /> New Transfer</button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search transfers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Status</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Transfer cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filtered.map(t => (
          <div key={t.id} className="card" style={{ cursor: 'pointer' }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', fontFamily: 'monospace' }}>{t.reference}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{t.product} · {t.responsible}</div>
                </div>
                <span className={`badge badge-${t.status}`}>
                  <span className="badge-dot" />
                  {statusLabels[t.status]}
                </span>
              </div>
              <div className="transfer-visual">
                <div className="transfer-point">
                  <div className="transfer-point-label">Source</div>
                  <div className="transfer-point-value">{t.from}</div>
                </div>
                <div className="transfer-arrow">
                  <ArrowRight size={24} />
                  <div className="transfer-arrow-qty">{t.quantity} {t.unit}</div>
                </div>
                <div className="transfer-point">
                  <div className="transfer-point-label">Destination</div>
                  <div className="transfer-point-value">{t.to}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                <span>Created: {t.createdAt}</span>
                <span>Completed: {t.completedAt || '—'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
