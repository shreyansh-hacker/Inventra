import React, { useState, useEffect } from 'react'
import { Search, History, Filter, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, Clock, RefreshCw } from 'lucide-react'
import api from '../services/api.js'

const opIcons = {
  Receipt: ArrowDownToLine,
  Delivery: ArrowUpFromLine,
  Transfer: ArrowLeftRight,
  Adjustment: SlidersHorizontal,
  Reservation: Clock
}

const opBadgeClass = {
  Receipt: 'received',
  Delivery: 'delivered',
  Transfer: 'moving',
  Adjustment: 'critical',
  Reservation: 'watch'
}

export default function MoveHistory() {
  const [movementsList, setMovementsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [opFilter, setOpFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [refreshing, setRefreshing] = useState(false)

  const loadMovements = async () => {
    try {
      const res = await api.movements.get()
      if (res.success && res.data) {
        setMovementsList(res.data)
      }
    } catch (err) {
      console.error('Failed to load move history:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMovements()
  }, [])

  const operations = [...new Set(movementsList.map(m => m.operation).filter(Boolean))]
  const filtered = movementsList.filter(m => {
    const matchSearch = (m.product || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.from || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.to || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.user || '').toLowerCase().includes(search.toLowerCase())
    const matchOp = opFilter === 'all' || m.operation === opFilter
    return matchSearch && matchOp
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Stock Movement History</h1>
            <p className="page-header-subtitle">Live chronological trail of all inbound, outbound, transfer, and count adjustment operations</p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadMovements(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <div style={{ display: 'flex', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('list')} style={{ borderRadius: 0 }}>List View</button>
              <button className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('timeline')} style={{ borderRadius: 0 }}>Timeline View</button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search movements by product, ref, location..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={opFilter} onChange={e => setOpFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Operations</option>
            {operations.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} total movements</span>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading movements from database...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          No movement history records found.
        </div>
      ) : viewMode === 'list' ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Timestamp</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Operation</th>
                <th>Auditor / User</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td className="text-mono font-semibold" style={{ color: 'var(--primary)' }}>{m.reference}</td>
                  <td style={{ fontSize: 'var(--font-xs)', whiteSpace: 'nowrap' }}>
                    {m.date ? new Date(m.date).toLocaleString() : '—'}
                  </td>
                  <td className="font-semibold">{m.product}</td>
                  <td className="font-semibold">{m.quantity}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{m.from}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{m.to}</td>
                  <td>
                    <span className={`badge badge-${opBadgeClass[m.operation] || 'draft'}`}>
                      {m.operation}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-xs)' }}>{m.user}</td>
                  <td>
                    <span className="badge badge-done">
                      <span className="badge-dot" />
                      {m.status || 'Verified'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="journey-timeline">
              {filtered.map((m) => (
                <div className="journey-event" key={m.id}>
                  <div className={`journey-event-dot ${m.operation === 'Receipt' ? 'receipt' : m.operation === 'Delivery' ? 'delivered' : m.operation === 'Transfer' ? 'moved' : m.operation === 'Adjustment' ? 'adjusted' : 'reserved'}`} />
                  <div className="journey-event-content">
                    <div className="journey-event-header">
                      <div className="journey-event-title">
                        <span style={{ marginRight: '8px' }}>{m.user}</span>
                        <span className={`badge badge-${opBadgeClass[m.operation] || 'draft'}`} style={{ fontSize: '11px' }}>{m.operation}</span>
                      </div>
                      <div className="journey-event-time">{m.date ? new Date(m.date).toLocaleString() : ''}</div>
                    </div>
                    <div className="journey-event-detail">
                      <strong>{m.product}</strong> · Quantity: <strong>{m.quantity}</strong> · {m.from} → {m.to}
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', fontFamily: 'monospace', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Ref: {m.reference} {m.notes ? `· ${m.notes}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
