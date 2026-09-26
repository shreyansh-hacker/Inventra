import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ScanLine, Check } from 'lucide-react'
import { products, warehouses } from '../data/demoData.js'

export default function StockCount() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [counts, setCounts] = useState({})
  const [selectedWarehouse, setSelectedWarehouse] = useState('WH01')
  const [started, setStarted] = useState(false)

  const warehouseProducts = products.filter(p => p.warehouseId === selectedWarehouse)
  const currentProduct = warehouseProducts[currentIndex]

  const counted = counts[currentProduct?.id] ?? ''
  const diff = counted !== '' ? counted - currentProduct?.onHand : null

  const handleCountChange = (val) => {
    const num = val === '' ? '' : parseInt(val, 10)
    if (val === '' || !isNaN(num)) {
      setCounts(prev => ({ ...prev, [currentProduct.id]: num }))
    }
  }

  if (!started) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-header-title">Stock Count</h1>
          <p className="page-header-subtitle">Count physical inventory and reconcile with system records</p>
        </div>
        <div className="stock-count-card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <ScanLine size={48} style={{ color: 'var(--primary)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Start a Stock Count</h2>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>
              Select a warehouse and count products one at a time. Differences will be flagged for adjustment.
            </p>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Warehouse</label>
            <select className="form-input form-select" value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>)}
            </select>
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>
            {warehouseProducts.length} products to count
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setStarted(true)} style={{ width: '100%', justifyContent: 'center' }}>
            Begin Count
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Stock Count</h1>
            <p className="page-header-subtitle">
              {warehouses.find(w => w.id === selectedWarehouse)?.name} — Product {currentIndex + 1} of {warehouseProducts.length}
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => setStarted(false)}>Exit Count</button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: '4px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-6)' }}>
        <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', width: `${((currentIndex + 1) / warehouseProducts.length) * 100}%`, transition: 'width var(--transition-normal)' }} />
      </div>

      <div className="stock-count-card">
        <div className="stock-count-product">{currentProduct.name}</div>
        <div className="stock-count-sku">{currentProduct.sku} · {currentProduct.location}</div>

        <div className="stock-count-expected">
          Expected: <strong>{currentProduct.onHand} {currentProduct.unit}</strong>
        </div>

        <div style={{ marginBottom: 'var(--space-2)' }}>
          <label className="form-label" style={{ textAlign: 'center' }}>Physical Count</label>
        </div>
        <input
          type="number"
          className="stock-count-input"
          value={counted}
          onChange={e => handleCountChange(e.target.value)}
          placeholder="0"
          autoFocus
        />

        {diff !== null && (
          <div className={`stock-count-diff ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'zero'}`}>
            Difference: {diff > 0 ? '+' : ''}{diff} {currentProduct.unit}
          </div>
        )}

        <div className="stock-count-nav">
          <button className="btn btn-secondary" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
            <ChevronLeft size={16} /> Previous
          </button>
          <button className="btn btn-primary" onClick={() => {
            if (currentIndex < warehouseProducts.length - 1) {
              setCurrentIndex(currentIndex + 1)
            }
          }}>
            {currentIndex === warehouseProducts.length - 1 ? (
              <><Check size={16} /> Submit Count</>
            ) : (
              <>Save & Next <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        <div style={{ marginTop: 'var(--space-5)' }}>
          <button className="btn btn-ghost btn-sm">
            <ScanLine size={14} /> Scan Barcode / QR
          </button>
        </div>
      </div>
    </div>
  )
}
