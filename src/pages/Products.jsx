import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Package, Download, ChevronDown } from 'lucide-react'
import { products } from '../data/demoData.js'

const healthLabels = { healthy: 'Healthy', watch: 'Watch', low: 'Low', critical: 'Critical', overstock: 'Overstock' }

export default function Products() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = [...new Set(products.map(p => p.category))]
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchHealth = healthFilter === 'all' || p.health === healthFilter
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchHealth && matchCat
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Products</h1>
            <p className="page-header-subtitle">{products.length} active products across all warehouses</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary"><Download size={16} /> Export</button>
            <button className="btn btn-primary"><Plus size={16} /> Add Product</button>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-controls-left">
          <div className="search-input">
            <Search size={16} className="search-input-icon" />
            <input placeholder="Search products, SKUs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-btn form-select" value={healthFilter} onChange={e => setHealthFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Health</option>
            <option value="healthy">Healthy</option>
            <option value="watch">Watch</option>
            <option value="low">Low</option>
            <option value="critical">Critical</option>
            <option value="overstock">Overstock</option>
          </select>
          <select className="filter-btn form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="table-controls-right">
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>{filtered.length} products</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Location</th>
              <th className="text-right">On Hand</th>
              <th className="text-right">Reserved</th>
              <th className="text-right">Available</th>
              <th>Health</th>
              <th>Last Movement</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="product-cell">
                    <div className="product-icon"><Package size={18} /></div>
                    <div>
                      <div className="product-name">{p.name}</div>
                      <div className="product-sku">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td>{p.category}</td>
                <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.location}</td>
                <td className="text-right font-semibold">{p.onHand.toLocaleString()} {p.unit}</td>
                <td className="text-right">{p.reserved} {p.unit}</td>
                <td className="text-right font-semibold">{p.available.toLocaleString()} {p.unit}</td>
                <td>
                  <span className={`badge badge-${p.health}`}>
                    <span className="badge-dot" />
                    {healthLabels[p.health]}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.lastMovement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
