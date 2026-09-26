import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Package, Download, RefreshCw, X, AlertCircle } from 'lucide-react'
import api from '../services/api.js'

const healthLabels = {
  healthy: 'Healthy',
  risk: 'Watch / Risk',
  watch: 'Watch / Risk',
  low: 'Low',
  critical: 'Critical',
  overstock: 'Overstock',
  excess: 'Excess'
}

export default function Products() {
  const navigate = useNavigate()
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: 'CAT01',
    unit: 'unit',
    initialStock: 0,
    cost: 0,
    sellingPrice: 0,
    reorderPoint: 20,
    minStock: 10,
    maxStock: 500,
    defaultWarehouseId: 'WH01'
  })

  const loadProducts = async () => {
    try {
      const res = await api.products.getAll()
      if (res.success && res.data) {
        setProductsList(res.data)
      }
    } catch (err) {
      console.error('Failed to load products from API:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadProducts()
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError('Name and SKU are required.')
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      const res = await api.products.create({
        ...formData,
        initialStock: Number(formData.initialStock) || 0,
        cost: Number(formData.cost) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        reorderPoint: Number(formData.reorderPoint) || 20,
        minStock: Number(formData.minStock) || 10,
        maxStock: Number(formData.maxStock) || 500,
      })

      if (res.success) {
        setShowAddModal(false)
        setFormData({
          name: '',
          sku: '',
          categoryId: 'CAT01',
          unit: 'unit',
          initialStock: 0,
          cost: 0,
          sellingPrice: 0,
          reorderPoint: 20,
          minStock: 10,
          maxStock: 500,
          defaultWarehouseId: 'WH01'
        })
        loadProducts()
      } else {
        setFormError(res.message || 'Failed to create product.')
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Unit', 'On Hand', 'Reserved', 'Available', 'Cost', 'Price', 'Health', 'Location']
    const rows = productsList.map(p => [
      p.id,
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      p.unit,
      p.onHand,
      p.reserved,
      p.available,
      p.cost,
      p.sellingPrice,
      p.health,
      `"${p.location}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `inventra_products_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categories = [...new Set(productsList.map(p => p.category).filter(Boolean))]
  
  const filtered = productsList.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').includes(search)
    const matchHealth = healthFilter === 'all' || p.health === healthFilter
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchHealth && matchCat
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Products & Inventory Stock</h1>
            <p className="page-header-subtitle">
              {productsList.length} active products managed across central & regional warehouses
            </p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input
              placeholder="Search products, SKUs, barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-btn form-select"
            value={healthFilter}
            onChange={e => setHealthFilter(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">All Health Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="risk">Risk / Watch</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical</option>
            <option value="overstock">Overstock / Excess</option>
          </select>
          <select
            className="filter-btn form-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="table-controls-right">
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
            Showing {filtered.length} of {productsList.length} items
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Primary Location</th>
              <th className="text-right">On Hand</th>
              <th className="text-right">Reserved</th>
              <th className="text-right">Available</th>
              <th>Health Status</th>
              <th>Last Transaction</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  Loading real-time catalog from MySQL database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                  No products found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="product-cell">
                      <div className="product-icon"><Package size={18} /></div>
                      <div>
                        <div className="product-name">{p.name}</div>
                        <div className="product-sku">{p.sku} {p.barcode ? `· ${p.barcode}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.location}</td>
                  <td className="text-right font-semibold">{Number(p.onHand || 0).toLocaleString()} {p.unit}</td>
                  <td className="text-right">{Number(p.reserved || 0).toLocaleString()} {p.unit}</td>
                  <td className="text-right font-semibold" style={{ color: (p.available || 0) <= (p.reorderPoint || 0) ? 'var(--danger-600)' : 'inherit' }}>
                    {Number(p.available || 0).toLocaleString()} {p.unit}
                  </td>
                  <td>
                    <span className={`badge badge-${p.health === 'risk' ? 'watch' : p.health === 'excess' ? 'overstock' : p.health}`}>
                      <span className="badge-dot" />
                      {healthLabels[p.health] || p.health}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                    {p.lastMovement ? new Date(p.lastMovement).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Product</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            {formError && (
              <div style={{ margin: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--danger-50)', color: 'var(--danger-700)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Copper Cable 4 sq mm"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CAB-004"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="CAT01">Raw Materials</option>
                    <option value="CAT02">Packaging Material</option>
                    <option value="CAT03">Office Supplies & Furniture</option>
                    <option value="CAT04">Electrical Components</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Unit of Measure</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="unit">unit</option>
                    <option value="kg">kg</option>
                    <option value="meter">meter</option>
                    <option value="box">box</option>
                    <option value="liter">liter</option>
                    <option value="piece">piece</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.initialStock}
                    onChange={e => setFormData({ ...formData, initialStock: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Reorder Safety Point</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.reorderPoint}
                    onChange={e => setFormData({ ...formData, reorderPoint: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Warehouse</label>
                  <select
                    className="form-select"
                    value={formData.defaultWarehouseId}
                    onChange={e => setFormData({ ...formData, defaultWarehouseId: e.target.value })}
                  >
                    <option value="WH01">Central Warehouse (Hub 1)</option>
                    <option value="WH02">Regional Facility (Site B)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating in Database...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
