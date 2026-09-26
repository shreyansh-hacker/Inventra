import React, { useState } from 'react'
import { Search, History, Filter, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, Clock } from 'lucide-react'
import { moveHistory } from '../data/demoData.js'

const opIcons = { Receipt: ArrowDownToLine, Delivery: ArrowUpFromLine, Transfer: ArrowLeftRight, Adjustment: SlidersHorizontal, Reservation: Clock }
const opBadgeClass = { Receipt: 'received', Delivery: 'delivered', Transfer: 'moving', Adjustment: 'critical', Reservation: 'watch' }

export default function MoveHistory() {
  const [search, setSearch] = useState('')
  const [opFilter, setOpFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')

  const operations = [...new Set(moveHistory.map(m => m.operation))]
  const filtered = moveHistory.filter(m => {
    const matchSearch = m.product.toLowerCase().includes(search.toLowerCase()) || m.reference.toLowerCase().includes(search.toLowerCase())
    const matchOp = opFilter === 'all' || m.operation === opFilter
    return matchSearch && matchOp
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Move History</h1>
            <p className="page-header-subtitle">Complete record of all inventory movements</p>
          </div>
          <div className="page-header-actions">
            <div style={{ display: 'flex', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('list')} style={{ borderRadius: 0 }}>List</button>
              <button className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('timeline')} style={{ borderRadius: 0 }}>Timeline</button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search movements..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={opFilter} onChange={e => setOpFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Operations</option>
            {operations.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} movements</span>
      </div>

      {viewMode === 'list' ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date/Time</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Operation</th>
                <th>User</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td className="text-mono font-semibold">{m.reference}</td>
                  <td style={{ fontSize: 'var(--font-xs)' }}>{m.date}</td>
                  <td className="font-semibold">{m.product}</td>
                  <td>{m.quantity}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{m.from}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{m.to}</td>
                  <td><span className={`badge badge-${opBadgeClass[m.operation] || 'draft'}`}>{m.operation}</span></td>
                  <td>{m.user}</td>
                  <td><span className={`badge badge-${m.status === 'done' || m.status === 'delivered' || m.status === 'applied' ? 'done' : m.status === 'moving' || m.status === 'in-progress' ? 'moving' : 'draft'}`}><span className="badge-dot" />{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="journey-timeline">
              {filtered.map((m, i) => (
                <div className="journey-event" key={m.id}>
                  <div className={`journey-event-dot ${m.operation === 'Receipt' ? 'receipt' : m.operation === 'Delivery' ? 'delivered' : m.operation === 'Transfer' ? 'moved' : m.operation === 'Adjustment' ? 'adjusted' : 'reserved'}`} />
                  <div className="journey-event-content">
                    <div className="journey-event-header">
                      <div className="journey-event-title">
                        <span style={{ marginRight: '8px' }}>{m.user}</span>
                        <span className={`badge badge-${opBadgeClass[m.operation] || 'draft'}`} style={{ fontSize: '11px' }}>{m.operation}</span>
                      </div>
                      <div className="journey-event-time">{m.date}</div>
                    </div>
                    <div className="journey-event-detail">
                      <strong>{m.product}</strong> · {m.quantity} · {m.from} → {m.to}
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-quaternary)', marginTop: '4px' }}>{m.reference}</div>
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
