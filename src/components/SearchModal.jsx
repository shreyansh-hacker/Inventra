import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, MapPin, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, X, Clock, SlidersHorizontal } from 'lucide-react'
import api from '../services/api.js'

const typeIconMap = {
  product: Package,
  receipt: ArrowDownToLine,
  delivery: ArrowUpFromLine,
  transfer: ArrowLeftRight,
  adjustment: SlidersHorizontal,
  location: MapPin
}

const defaultItems = [
  { type: 'product', title: 'Products Catalog', subtitle: 'Browse all products and SKU items', url: '/products' },
  { type: 'receipt', title: 'Inbound Receipts', subtitle: 'Receive purchase orders and supplier deliveries', url: '/receipts' },
  { type: 'delivery', title: 'Outbound Deliveries', subtitle: 'Fulfill customer dispatch orders', url: '/deliveries' },
  { type: 'transfer', title: 'Internal Transfers', subtitle: 'Rebalance stock between warehouse locations', url: '/transfers' },
  { type: 'adjustment', title: 'Stock Adjustments', subtitle: 'Physical count variance and reconciliations', url: '/adjustments' },
  { type: 'location', title: 'Interactive Map', subtitle: 'Warehouse zones, racks, and bins', url: '/inventory-map' },
]

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(defaultItems)
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (!query.trim()) {
      setResults(defaultItems)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.search.query(query.trim())
        if (res.success && res.data) {
          setResults(res.data)
        }
      } catch (err) {
        console.error('Search query error:', err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (item) => {
    navigate(item.url || '/')
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
            placeholder="Search products, SKUs, references, barcodes, locations..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} style={{ color: 'var(--text-quaternary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div className="search-results">
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
              Searching live inventory database...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
              No matches found for "{query}"
            </div>
          ) : (
            results.map((item, i) => {
              const IconComp = typeIconMap[item.type] || Package
              return (
                <div key={i} className="search-result-item" onClick={() => handleSelect(item)}>
                  <div className="search-result-icon">
                    <IconComp size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                      {item.subtitle}
                    </div>
                  </div>
                  <span className="badge badge-draft" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                    {item.type}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
