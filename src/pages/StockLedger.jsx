import React, { useState, useEffect } from 'react'
import { Search, BookOpen, Download, RefreshCw, ShieldCheck } from 'lucide-react'
import api from '../services/api.js'

export default function StockLedger() {
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const loadLedger = async () => {
    try {
      const res = await api.ledger.get()
      if (res.success && res.data) {
        setLedgerEntries(res.data)
      }
    } catch (err) {
      console.error('Failed to load ledger:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadLedger()
  }, [])

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Product', 'Location', 'Operation', 'Change', 'Reference', 'User', 'Audit Notes']
    const rows = ledgerEntries.map(e => [
      `"${new Date(e.time).toISOString()}"`,
      `"${e.product}"`,
      `"${e.location}"`,
      e.movement,
      e.change,
      e.reference,
      `"${e.user}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `inventra_stock_ledger_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = ledgerEntries.filter(s =>
    (s.product || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.movement || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.user || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Immutable Stock Ledger</h1>
            <p className="page-header-subtitle">
              Cryptographically timestamped, append-only transaction ledger of all inventory custody modifications
            </p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadLedger(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} /> Export Audit Ledger
            </button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search ledger entries by product, ref, location, user..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
          {filtered.length} verified immutable transactions
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Product</th>
              <th>Location</th>
              <th>Operation</th>
              <th className="text-right">Stock Delta</th>
              <th>Custody Ref</th>
              <th>Auditor / User</th>
              <th>Audit Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  Verifying and loading immutable ledger transactions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                  No transaction ledger records found matching filter.
                </td>
              </tr>
            ) : (
              filtered.map(entry => (
                <tr key={entry.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)', whiteSpace: 'nowrap' }}>
                    {entry.time ? new Date(entry.time).toLocaleString() : '—'}
                  </td>
                  <td className="font-semibold">{entry.product}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{entry.location}</td>
                  <td>
                    <span className={`badge ${
                      entry.movement === 'Receipt' || entry.movement === 'Transfer In' ? 'badge-received' :
                      entry.movement === 'Adjustment' ? 'badge-critical' :
                      entry.movement === 'Reservation' ? 'badge-watch' :
                      entry.movement === 'Delivery' ? 'badge-low' : 'badge-moving'
                    }`}>
                      {entry.movement}
                    </span>
                  </td>
                  <td className={`text-right font-semibold ${Number(entry.change) > 0 ? 'amount-positive' : 'amount-negative'}`} style={{ fontFamily: 'monospace' }}>
                    {Number(entry.change) > 0 ? `+${entry.change}` : entry.change} {entry.unit || ''}
                  </td>
                  <td className="text-mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>{entry.reference}</td>
                  <td style={{ fontSize: 'var(--font-xs)' }}>{entry.user}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                    {entry.notes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <ShieldCheck size={18} style={{ color: 'var(--success-600)' }} />
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
          <strong>Immutable Custody Guarantee:</strong> Ledger entries cannot be deleted, updated, or manipulated. Historical records are permanent — corrections are applied as new adjustment transactions pursuant to audit requirements.
        </span>
      </div>
    </div>
  )
}
