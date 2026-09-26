import React, { useState, useEffect } from 'react'
import { Search, Plus, ArrowRight, ArrowLeftRight, RefreshCw, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react'
import api from '../services/api.js'

const statusLabels = {
  pending: 'Pending',
  moving: 'Moving',
  done: 'Completed',
  canceled: 'Canceled'
}

export default function Transfers() {
  const [transfersList, setTransfersList] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // New Transfer Modal State
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    productId: 'PRD01',
    fromLocationId: 'LOC-WH01-SZA-R01',
    toLocationId: 'LOC-WH01-PF-R01',
    quantity: 10,
    notes: 'Internal stock rebalancing'
  })

  const loadData = async () => {
    try {
      const [transRes, sugRes, prodRes] = await Promise.allSettled([
        api.transfers.getAll(),
        api.transfers.getSuggestions(),
        api.products.getAll()
      ])

      if (transRes.status === 'fulfilled' && transRes.value?.success) {
        setTransfersList(transRes.value.data || [])
      }
      if (sugRes.status === 'fulfilled' && sugRes.value?.success) {
        setSuggestions(sugRes.value.data || [])
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProductsList(prodRes.value.data || [])
      }
    } catch (err) {
      console.error('Failed to load transfers:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApproveSuggestion = async (sug) => {
    if (!window.confirm(`Approve Smart Transfer of ${sug.recommendedTransferQty} ${sug.unit} of ${sug.productName} from ${sug.fromLocationName} to ${sug.toLocationName}?`)) {
      return
    }

    try {
      setActionError('')
      setActionSuccess('')
      const res = await api.transfers.approveSuggestion({
        suggestionId: sug.id,
        productId: sug.productId,
        fromLocationId: sug.fromLocationId,
        toLocationId: sug.toLocationId,
        quantity: sug.recommendedTransferQty,
        notes: `Smart Rebalancing: ${sug.reason}`
      })

      if (res.success) {
        setActionSuccess(`Smart Transfer executed! Reference: ${res.data.referenceNumber}. Company total stock preserved.`)
        loadData()
      } else {
        setActionError(res.message || 'Failed to execute smart transfer.')
      }
    } catch (err) {
      setActionError(err.message || 'Error executing smart transfer.')
    }
  }

  const handleCreateTransfer = async (e) => {
    e.preventDefault()
    if (formData.fromLocationId === formData.toLocationId) {
      setActionError('Source and destination locations cannot be identical.')
      return
    }

    setSubmitting(true)
    setActionError('')
    setActionSuccess('')

    try {
      // 1. Create Transfer
      const createRes = await api.transfers.create({
        productId: formData.productId,
        fromLocationId: formData.fromLocationId,
        toLocationId: formData.toLocationId,
        quantity: Number(formData.quantity) || 1,
        notes: formData.notes
      })

      if (createRes.success && createRes.data?.id) {
        // 2. Validate Transfer immediately to execute stock move
        const valRes = await api.transfers.validate(createRes.data.id)
        if (valRes.success) {
          setActionSuccess(`Transfer ${valRes.data?.referenceNumber || createRes.data?.referenceNumber} completed successfully! Stock moved between locations.`)
          setShowModal(false)
          loadData()
        } else {
          setActionError(valRes.message || 'Transfer created but validation failed.')
        }
      } else {
        setActionError(createRes.message || 'Failed to create transfer.')
      }
    } catch (err) {
      setActionError(err.message || 'Failed to process transfer. Check source stock balance.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = transfersList.filter(t => {
    const matchSearch = (t.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.product || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.from || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.to || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Internal Stock Transfers</h1>
            <p className="page-header-subtitle">
              Rebalance stock between warehouse racks, zones, and facilities with 100% custody tracking
            </p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadData(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Internal Transfer
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--success-50)', color: 'var(--success-700)', border: '1px solid var(--success-100)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--danger-50)', color: 'var(--danger-700)', border: '1px solid var(--danger-100)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Smart Transfer Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="card mb-6" style={{ border: '1px solid var(--primary-200)', background: 'var(--primary-50)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--primary-100)' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-900)' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              <span>Smart Transfer Suggestions (AI / Rule-Based Rebalancing)</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {suggestions.map((sug) => (
                <div key={sug.id} style={{ padding: 'var(--space-3)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                      Rebalance: {sug.productName} ({sug.sku})
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Transfer <strong>{sug.recommendedTransferQty} {sug.unit}</strong> from <em>{sug.fromLocationName}</em> to <em>{sug.toLocationName}</em>
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--info-700)', marginTop: '4px' }}>
                      💡 {sug.reason}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleApproveSuggestion(sug)}>
                    Approve & Transfer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search transfers, products, locations..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} transfer operations</span>
      </div>

      {/* Transfer cards visual */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading transfers from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No internal transfer movements recorded matching criteria.
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', fontFamily: 'monospace' }}>{t.reference}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                      Product: <strong>{t.product}</strong> · Responsible: {t.responsible}
                    </div>
                  </div>
                  <span className={`badge badge-${t.status === 'done' ? 'healthy' : 'watch'}`}>
                    <span className="badge-dot" />
                    {statusLabels[t.status] || t.status}
                  </span>
                </div>
                <div className="transfer-visual">
                  <div className="transfer-point">
                    <div className="transfer-point-label">Source Location</div>
                    <div className="transfer-point-value">{t.from}</div>
                    {t.fromFull && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{t.fromFull}</div>}
                  </div>
                  <div className="transfer-arrow">
                    <ArrowRight size={24} />
                    <div className="transfer-arrow-qty font-semibold">{t.quantity} {t.unit}</div>
                  </div>
                  <div className="transfer-point">
                    <div className="transfer-point-label">Destination Location</div>
                    <div className="transfer-point-value">{t.to}</div>
                    {t.toFull && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{t.toFull}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)' }}>
                  <span>Created: {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}</span>
                  <span>Completed: {t.completedAt ? new Date(t.completedAt).toLocaleString() : 'In Progress'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Transfer Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Initiate Internal Stock Transfer</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateTransfer}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label className="form-label">Select Product to Move *</label>
                  <select
                    className="form-select"
                    value={formData.productId}
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  >
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Available: {p.available} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Source Location (Pick From) *</label>
                  <select
                    className="form-select"
                    value={formData.fromLocationId}
                    onChange={e => setFormData({ ...formData, fromLocationId: e.target.value })}
                  >
                    <option value="LOC-WH01-SZA-R01">Main Warehouse → Storage Zone A → Rack A01</option>
                    <option value="LOC-WH01-SZB-R01">Main Warehouse → Storage Zone B → Rack B01</option>
                    <option value="LOC-WH01-PF-R01">Main Warehouse → Production Floor → Rack P01</option>
                    <option value="LOC-WH02-MF-R01">Regional Facility → Main Floor → Rack M01</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Destination Location (Place Into) *</label>
                  <select
                    className="form-select"
                    value={formData.toLocationId}
                    onChange={e => setFormData({ ...formData, toLocationId: e.target.value })}
                  >
                    <option value="LOC-WH01-PF-R01">Main Warehouse → Production Floor → Rack P01</option>
                    <option value="LOC-WH01-SZA-R01">Main Warehouse → Storage Zone A → Rack A01</option>
                    <option value="LOC-WH01-SZB-R01">Main Warehouse → Storage Zone B → Rack B01</option>
                    <option value="LOC-WH02-MF-R01">Regional Facility → Main Floor → Rack M01</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Quantity to Transfer *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Reason / Work Order Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Production line replenishment / WO-492"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Executing Transfer...' : 'Execute Stock Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
