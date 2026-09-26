import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, MapPin, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, X } from 'lucide-react'
import { products, receipts, deliveries, transfers, warehouses } from '../data/demoData.js'

const searchItems = [
  ...products.map(p => ({ type: 'Product', icon: Package, label: p.name, sub: p.sku, path: `/products/${p.id}` })),
  ...receipts.map(r => ({ type: 'Receipt', icon: ArrowDownToLine, label: r.reference, sub: r.supplier, path: `/receipts/${r.id}` })),
  ...deliveries.map(d => ({ type: 'Delivery', icon: ArrowUpFromLine, label: d.reference, sub: d.customer, path: `/deliveries/${d.id}` })),
  ...transfers.map(t => ({ type: 'Transfer', icon: ArrowLeftRight, label: t.reference, sub: t.product, path: `/transfers` })),
  ...warehouses.map(w => ({ type: 'Warehouse', icon: MapPin, label: w.name, sub: w.shortCode, path: `/inventory-map` })),
]

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = query.length > 0
    ? searchItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : searchItems.slice(0, 8)

  const handleSelect = (item) => {
    navigate(item.path)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-input">
          <Search size={20} style={{ color: 'var(--text-quaternary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, SKUs, references, warehouses..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} style={{ color: 'var(--text-quaternary)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="search-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
              No results found for "{query}"
            </div>
          ) : (
            filtered.map((item, i) => (
              <div key={i} className="search-result-item" onClick={() => handleSelect(item)}>
                <div className="search-result-icon">
                  <item.icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{item.sub}</div>
                </div>
                <span className="badge badge-draft" style={{ fontSize: '11px' }}>{item.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
