import React, { useState, useEffect } from 'react'
import { Search, Plus, SlidersHorizontal, Check, RefreshCw, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '../services/api.js'

const statusLabels = {
  applied: 'Applied',
  pending: 'Pending Review',
  canceled: 'Canceled',
  rejected: 'Rejected'
}

export default function Adjustments() {
  const [adjustmentsList, setAdjustmentsList] = useState([])
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // New Adjustment Modal
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    productId: 'PRD01',
    locationId: 'LOC-WH01-SZA-R01',
    countedQty: 30,
    reason: 'DAMAGE',
    notes: 'Physical audit count variance'
  })

  const loadData = async () => {
    try {
      const [adjRes, prodRes] = await Promise.allSettled([
        api.adjustments.getAll(),
        api.products.getAll()
      ])

      if (adjRes.status === 'fulfilled' && adjRes.value?.success) {
        setAdjustmentsList(adjRes.value.data || [])
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProductsList(prodRes.value.data || [])
      }
    } catch (err) {
      console.error('Failed to load adjustments:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedProduct = productsList.find(p => p.id === formData.productId)
  const systemQty = selectedProduct?.available ?? 0
  const difference = Number(formData.countedQty || 0) - systemQty

  const handleCreateAdjustment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionSuccess('')

    try {
      // 1. Create Adjustment
      const createRes = await api.adjustments.create({
        productId: formData.productId,
        locationId: formData.locationId,
        countedQty: Number(formData.countedQty),
        reason: formData.reason,
        notes: formData.notes
      })

      if (createRes.success && createRes.data?.id) {
        // 2. Automatically apply and reconcile
        const applyRes = await api.adjustments.apply(createRes.data.id)
        if (applyRes.success) {
          setActionSuccess(`Adjustment ${createRes.data.referenceNumber || 'reconciliation'} applied! Inventory adjusted by ${difference >= 0 ? `+${difference}` : difference} ${selectedProduct?.unit || 'units'}.`)
          setShowModal(false)
          loadData()
        } else {
          setActionError(applyRes.message || 'Adjustment created but reconciliation failed.')
        }
      } else {
        setActionError(createRes.message || 'Failed to create adjustment.')
      }
    } catch (err) {
      setActionError(err.message || 'Error processing adjustment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await api.adjustments.apply(id)
      if (res.success) {
        setActionSuccess('Adjustment approved and inventory ledger updated.')
        loadData()
      } else {
        setActionError(res.message || 'Approval failed.')
      }
    } catch (err) {
      setActionError(err.message || 'Failed to approve adjustment.')
    }
  }

  const filtered = adjustmentsList.filter(a =>
    (a.reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.product || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.reason || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Stock Adjustments & Reconciliation</h1>
            <p className="page-header-subtitle">
              Reconcile physical inventory counts, write off damaged goods, and maintain audit transparency
            </p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadData(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Stock Adjustment
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

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search adjustments by ref, product, reason..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
          {filtered.length} adjustment records
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading adjustments from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No stock adjustments recorded.
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', fontFamily: 'monospace' }}>{a.reference}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                      Product: <strong>{a.product}</strong> · Location: {a.location} · Auditor: {a.responsible}
                    </div>
                  </div>
                  <span className={`badge badge-${a.status === 'applied' ? 'healthy' : a.status === 'pending' ? 'watch' : 'canceled'}`}>
                    <span className="badge-dot" />
                    {statusLabels[a.status] || a.status}
                  </span>
                </div>

                <div className="adjustment-compare">
                  <div className="adjustment-value">
                    <div className="adjustment-value-label">System Expected Qty</div>
                    <div className="adjustment-value-number">{a.systemQty} {a.unit}</div>
                  </div>
                  <div className="adjustment-vs">vs</div>
                  <div className="adjustment-value">
                    <div className="adjustment-value-label">Physical Count</div>
                    <div className="adjustment-value-number font-semibold">{a.countedQty} {a.unit}</div>
                  </div>
                  <div className="adjustment-vs">=</div>
                  <div className="adjustment-value">
                    <div className="adjustment-value-label">Adjustment Delta</div>
                    <div className={`adjustment-value-number font-semibold ${a.difference < 0 ? 'negative' : ''}`}
                      style={{ color: a.difference > 0 ? 'var(--success-600)' : a.difference < 0 ? 'var(--danger-600)' : 'var(--text-tertiary)' }}>
                      {a.difference > 0 ? '+' : ''}{a.difference} {a.unit}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
                  <span>Audit Reason: <strong style={{ color: 'var(--text-primary)' }}>{a.reason}</strong></span>
                  <span>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</span>
                </div>
                {a.notes && (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                    Notes: {a.notes}
                  </div>
                )}
                {a.status === 'pending' && (
                  <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(a.id)}>
                      <Check size={12} /> Approve Reconciliation
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Adjustment Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Record Physical Stock Adjustment</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateAdjustment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label className="form-label">Select Product *</label>
                  <select
                    className="form-select"
                    value={formData.productId}
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  >
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — System: {p.available} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Warehouse Location *</label>
                  <select
                    className="form-select"
                    value={formData.locationId}
                    onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                  >
                    <option value="LOC-WH01-SZA-R01">Main Warehouse → Storage Zone A → Rack A01</option>
                    <option value="LOC-WH01-SZB-R01">Main Warehouse → Storage Zone B → Rack B01</option>
                    <option value="LOC-WH01-PF-R01">Main Warehouse → Production Floor → Rack P01</option>
                    <option value="LOC-WH02-MF-R01">Regional Facility → Main Floor → Rack M01</option>
                  </select>
                </div>

                <div style={{ padding: 'var(--space-3)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current System Available:</span>
                  <strong>{systemQty} {selectedProduct?.unit || 'units'}</strong>
                </div>

                <div>
                  <label className="form-label">Actual Physical Count Counted *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.countedQty}
                    onChange={e => setFormData({ ...formData, countedQty: e.target.value })}
                    required
                  />
                </div>

                <div style={{ padding: 'var(--space-3)', background: difference < 0 ? 'var(--danger-50)' : difference > 0 ? 'var(--success-50)' : 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Calculated Inventory Adjustment:</span>
                  <strong style={{ color: difference < 0 ? 'var(--danger-700)' : difference > 0 ? 'var(--success-700)' : 'inherit' }}>
                    {difference > 0 ? `+${difference}` : difference} {selectedProduct?.unit || 'units'}
                  </strong>
                </div>

                <div>
                  <label className="form-label">Adjustment Reason *</label>
                  <select
                    className="form-select"
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  >
                    <option value="DAMAGE">Physical Damage / Breakage</option>
                    <option value="SPOILAGE">Expiry / Spoilage</option>
                    <option value="THEFT">Pilferage / Theft</option>
                    <option value="FOUND_STOCK">Surplus / Found Stock</option>
                    <option value="DATA_CORRECTION">Cycle Count Correction</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Audit Notes & Observations</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Moisture ingress on bottom shelf during monsoon"
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
                  {submitting ? 'Applying Adjustment...' : 'Apply & Reconcile Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
