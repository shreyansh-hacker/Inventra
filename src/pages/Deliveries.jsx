import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ArrowUpFromLine, RefreshCw, X, AlertCircle } from 'lucide-react'
import api from '../services/api.js'

const statusLabels = {
  draft: 'Draft',
  waiting: 'Waiting',
  ready: 'Ready',
  picking: 'Picking',
  packed: 'Packed',
  delivered: 'Delivered',
  done: 'Done',
  canceled: 'Canceled'
}

export default function Deliveries() {
  const navigate = useNavigate()
  const [deliveriesList, setDeliveriesList] = useState([])
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // New Delivery Modal
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    customerId: 'CUS01',
    warehouseId: 'WH01',
    address: 'Customer Site / Delivery Dock A',
    productId: 'PRD01',
    quantity: 10,
    notes: ''
  })

  const loadData = async () => {
    try {
      const [delRes, prodRes] = await Promise.allSettled([
        api.deliveries.getAll(),
        api.products.getAll()
      ])

      if (delRes.status === 'fulfilled' && delRes.value?.success) {
        setDeliveriesList(delRes.value.data || [])
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProductsList(prodRes.value.data || [])
      }
    } catch (err) {
      console.error('Error loading deliveries data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateDelivery = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      const res = await api.deliveries.create({
        customerId: formData.customerId,
        warehouseId: formData.warehouseId,
        address: formData.address,
        notes: formData.notes,
        items: [
          {
            productId: formData.productId,
            requested: Number(formData.quantity) || 1,
            unit: productsList.find(p => p.id === formData.productId)?.unit || 'unit'
          }
        ]
      })

      if (res.success) {
        setShowModal(false)
        loadData()
        if (res.data?.id) {
          navigate(`/deliveries/${res.data.id}`)
        }
      } else {
        setFormError(res.message || 'Failed to create delivery.')
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create delivery.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = deliveriesList.filter(d => {
    const matchSearch = (d.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.customer || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Outbound Deliveries</h1>
            <p className="page-header-subtitle">Manage customer dispatches, picking lists, and stock fulfillment</p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadData(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Outbound Delivery
            </button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search deliveries, customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
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
              <th>Origin Warehouse</th>
              <th>Delivery Address</th>
              <th>Date</th>
              <th>Products</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  Loading outbound deliveries from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                  No delivery orders found matching filter.
                </td>
              </tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id} onClick={() => navigate(`/deliveries/${d.id}`)} style={{ cursor: 'pointer' }}>
                  <td className="font-semibold text-mono">{d.reference}</td>
                  <td>{d.customer}</td>
                  <td>{d.warehouse}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{d.address}</td>
                  <td>{d.scheduleDate || (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—')}</td>
                  <td>{d.items?.length || 0} product(s)</td>
                  <td>
                    <span className={`badge badge-${d.status === 'delivered' || d.status === 'done' ? 'healthy' : 'watch'}`}>
                      <span className="badge-dot" />
                      {statusLabels[d.status] || d.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Delivery Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Outbound Customer Delivery</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {formError && (
              <div style={{ margin: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--danger-50)', color: 'var(--danger-700)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDelivery}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label className="form-label">Customer *</label>
                  <select
                    className="form-select"
                    value={formData.customerId}
                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="CUS01">Metro Constructions</option>
                    <option value="CUS02">Apex Interiors</option>
                    <option value="CUS03">BuildWell Infrastructure</option>
                    <option value="CUS04">Zenith Retailers</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Dispatching Warehouse *</label>
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
                  <label className="form-label">Product to Deliver *</label>
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
                  <label className="form-label">Quantity to Dispatch *</label>
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
                  <label className="form-label">Destination Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating Delivery...' : 'Create Delivery Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
