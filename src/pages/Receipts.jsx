import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ArrowDownToLine, Filter } from 'lucide-react'
import { receipts } from '../data/demoData.js'

const statusLabels = { draft: 'Draft', waiting: 'Waiting', ready: 'Ready', received: 'Received', done: 'Done', canceled: 'Canceled' }

export default function Receipts() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = receipts.filter(r => {
    const matchSearch = r.reference.toLowerCase().includes(search.toLowerCase()) || r.supplier.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Receipts</h1>
            <p className="page-header-subtitle">Manage incoming stock from suppliers</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary"><Plus size={16} /> New Receipt</button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search receipts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Status</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} receipts</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Destination</th>
              <th>Schedule Date</th>
              <th>Items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} onClick={() => navigate(`/receipts/${r.id}`)} style={{ cursor: 'pointer' }}>
                <td className="font-semibold text-mono">{r.reference}</td>
                <td>{r.supplier}</td>
                <td>{r.warehouse}</td>
                <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{r.destination}</td>
                <td>{r.scheduleDate}</td>
                <td>{r.items.length} products</td>
                <td>
                  <span className={`badge badge-${r.status}`}>
                    <span className="badge-dot" />
                    {statusLabels[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
