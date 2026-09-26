import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ArrowDownToLine, RefreshCw, X, AlertCircle } from 'lucide-react'
import api from '../services/api.js'

const statusLabels = {
  draft: 'Draft',
  waiting: 'Waiting',
  ready: 'Ready',
  received: 'Received',
  done: 'Done',
  canceled: 'Canceled'
}

export default function Receipts() {
  const navigate = useNavigate()
  const [receiptsList, setReceiptsList] = useState([])
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // New Receipt Modal State
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    supplierId: 'SUP01',
    warehouseId: 'WH01',
    notes: '',
    productId: 'PRD01',
    quantity: 50
  })

  const loadData = async () => {
    try {
      const [recRes, prodRes] = await Promise.allSettled([
        api.receipts.getAll(),
        api.products.getAll()
      ])

      if (recRes.status === 'fulfilled' && recRes.value?.success) {
        setReceiptsList(recRes.value.data || [])
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProductsList(prodRes.value.data || [])
      }
    } catch (err) {
      console.error('Error loading receipts data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateReceipt = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      const res = await api.receipts.create({
        supplierId: formData.supplierId,
        warehouseId: formData.warehouseId,
        notes: formData.notes,
        items: [
          {
            productId: formData.productId,
            expected: Number(formData.quantity) || 1,
            unit: productsList.find(p => p.id === formData.productId)?.unit || 'unit'
          }
        ]
      })

      if (res.success) {
        setShowModal(false)
        loadData()
        if (res.data?.id) {
          navigate(`/receipts/${res.data.id}`)
        }
      } else {
        setFormError(res.message || 'Failed to create receipt.')
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create receipt.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = receiptsList.filter(r => {
    const matchSearch = (r.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.supplier || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Inbound Receipts</h1>
            <p className="page-header-subtitle">Manage incoming purchase orders and supplier deliveries into warehouse stock</p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadData(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Inbound Receipt
            </button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search receipts, suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
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
              <th>Date</th>
              <th>Products</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  Loading receipts from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                  No receipts found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} onClick={() => navigate(`/receipts/${r.id}`)} style={{ cursor: 'pointer' }}>
                  <td className="font-semibold text-mono">{r.reference}</td>
                  <td>{r.supplier}</td>
                  <td>{r.warehouse}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{r.destination}</td>
                  <td>{r.scheduleDate || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—')}</td>
                  <td>{r.items?.length || 0} product(s)</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>
                      <span className="badge-dot" />
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Receipt Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Inbound Stock Receipt</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {formError && (
              <div style={{ margin: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--danger-50)', color: 'var(--danger-700)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReceipt}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label className="form-label">Select Supplier *</label>
                  <select
                    className="form-select"
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  >
                    <option value="SUP01">Tata Steel Ltd</option>
                    <option value="SUP02">Havells India</option>
                    <option value="SUP03">Ultratech Cement</option>
                    <option value="SUP04">Supreme Industries</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Destination Warehouse *</label>
                  <select
                    className="form-select"
                    value={formData.warehouseId}
                    onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                  >
                    <option value="WH01">Central Warehouse (Hub 1)</option>
                    <option value="WH02">Regional Facility (Site B)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Product to Receive *</label>
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
                  <label className="form-label">Quantity to Receive *</label>
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
                  <label className="form-label">Notes / Carrier PO</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PO-8921 / Delivery truck WB-02-1234"
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
                  {submitting ? 'Creating Receipt...' : 'Create Draft Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
