import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ArrowUpFromLine } from 'lucide-react'
import { deliveries } from '../data/demoData.js'

const statusLabels = { draft: 'Draft', waiting: 'Waiting', ready: 'Ready', picking: 'Picking', packed: 'Packed', delivered: 'Delivered', done: 'Done', canceled: 'Canceled' }

export default function Deliveries() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = deliveries.filter(d => {
    const matchSearch = d.reference.toLowerCase().includes(search.toLowerCase()) || d.customer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Deliveries</h1>
            <p className="page-header-subtitle">Manage outgoing stock to customers</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary"><Plus size={16} /> New Delivery</button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search deliveries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Status</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} deliveries</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Warehouse</th>
              <th>Schedule Date</th>
              <th>Items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} onClick={() => navigate(`/deliveries/${d.id}`)} style={{ cursor: 'pointer' }}>
                <td className="font-semibold text-mono">{d.reference}</td>
                <td>{d.customer}</td>
                <td>{d.warehouse}</td>
                <td>{d.scheduleDate}</td>
                <td>{d.items.length} products</td>
                <td>
                  <span className={`badge badge-${d.status}`}>
                    <span className="badge-dot" />
                    {statusLabels[d.status]}
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
