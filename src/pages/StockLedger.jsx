import React, { useState } from 'react'
import { Search, BookOpen, Download } from 'lucide-react'
import { stockLedger } from '../data/demoData.js'

export default function StockLedger() {
  const [search, setSearch] = useState('')

  const filtered = stockLedger.filter(s =>
    s.product.toLowerCase().includes(search.toLowerCase()) ||
    s.reference.toLowerCase().includes(search.toLowerCase()) ||
    s.movement.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Stock Ledger</h1>
            <p className="page-header-subtitle">Immutable transaction log of all inventory changes</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary"><Download size={16} /> Export</button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search ledger entries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} entries</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Product</th>
              <th>Location</th>
              <th>Movement</th>
              <th className="text-right">Before</th>
              <th className="text-right">Change</th>
              <th className="text-right">After</th>
              <th>Reference</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => (
              <tr key={entry.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)', whiteSpace: 'nowrap' }}>{entry.time}</td>
                <td className="font-semibold">{entry.product}</td>
                <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{entry.location}</td>
                <td>
                  <span className={`badge ${
                    entry.movement === 'Receipt' || entry.movement === 'Transfer In' ? 'badge-received' :
                    entry.movement === 'Adjustment' ? 'badge-critical' :
                    entry.movement === 'Reservation' ? 'badge-watch' :
                    entry.movement === 'Transfer Out' ? 'badge-moving' : 'badge-draft'
                  }`}>
                    {entry.movement}
                  </span>
                </td>
                <td className="text-right" style={{ fontFamily: 'monospace' }}>{entry.before}</td>
                <td className={`text-right font-semibold ${entry.change > 0 ? 'amount-positive' : 'amount-negative'}`} style={{ fontFamily: 'monospace' }}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </td>
                <td className="text-right font-semibold" style={{ fontFamily: 'monospace' }}>{entry.after}</td>
                <td className="text-mono" style={{ color: 'var(--primary)' }}>{entry.reference}</td>
                <td style={{ fontSize: 'var(--font-xs)' }}>{entry.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <BookOpen size={14} style={{ color: 'var(--text-tertiary)' }} />
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
          Ledger entries are immutable. Historical records are never modified — corrections are applied as new adjustment transactions.
        </span>
      </div>
    </div>
  )
}
