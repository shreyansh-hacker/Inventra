import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ScanLine, Check, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import api from '../services/api.js'

export default function StockCount() {
  const navigate = useNavigate()
  const [warehousesList, setWarehousesList] = useState([])
  const [productsList, setProductsList] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState('WH01')
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [counts, setCounts] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [summaryReport, setSummaryReport] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [whRes, prodRes] = await Promise.allSettled([
          api.warehouses.getAll(),
          api.products.getAll()
        ])

        if (whRes.status === 'fulfilled' && whRes.value?.success) {
          setWarehousesList(whRes.value.data || [])
          if (whRes.value.data?.[0]?.id) {
            setSelectedWarehouse(whRes.value.data[0].id)
          }
        }
        if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
          setProductsList(prodRes.value.data || [])
        }
      } catch (err) {
        console.error('Failed to load count data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const warehouseProducts = productsList.filter(p => !selectedWarehouse || p.warehouseId === selectedWarehouse)
  const currentProduct = warehouseProducts[currentIndex]

  const counted = counts[currentProduct?.id] ?? ''
  const diff = counted !== '' && currentProduct ? counted - (currentProduct.onHand || 0) : null

  const handleCountChange = (val) => {
    const num = val === '' ? '' : parseInt(val, 10)
    if (val === '' || !isNaN(num)) {
      setCounts(prev => ({ ...prev, [currentProduct.id]: num }))
    }
  }

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    const adjustmentsCreated = []

    try {
      for (const p of warehouseProducts) {
        const physical = counts[p.id]
        if (physical !== undefined && physical !== '' && physical !== p.onHand) {
          const delta = physical - p.onHand
          const res = await api.adjustments.create({
            productId: p.id,
            locationId: p.locationId || 'LOC-WH01-SZA-R01',
            countedQty: physical,
            reason: delta < 0 ? 'DAMAGE' : 'FOUND_STOCK',
            notes: `Cycle Count reconciliation on warehouse ${selectedWarehouse}`
          })
          if (res.success && res.data?.id) {
            await api.adjustments.apply(res.data.id)
            adjustmentsCreated.push({
              name: p.name,
              sku: p.sku,
              system: p.onHand,
              counted: physical,
              delta
            })
          }
        }
      }

      setSummaryReport(adjustmentsCreated)
      setCompleted(true)
    } catch (err) {
      console.error('Error submitting count adjustments:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading warehouse inventory catalog for stock audit...
      </div>
    )
  }

  if (completed) {
    return (
      <div className="stock-count-card" style={{ maxWidth: '640px', margin: '40px auto' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--success-500)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: '8px' }}>Cycle Count Audit Completed!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Physical inventory counts reconciled with live database.
        </p>

        {summaryReport.length > 0 ? (
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: '8px' }}>
              Adjustments Applied ({summaryReport.length}):
            </div>
            {summaryReport.map((item, idx) => (
              <div key={idx} style={{ padding: '8px 12px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
                <span>{item.name} ({item.sku})</span>
                <span style={{ fontWeight: 600, color: item.delta < 0 ? 'var(--danger-600)' : 'var(--success-600)' }}>
                  {item.delta > 0 ? `+${item.delta}` : item.delta} units
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            🎉 100% Match! No count variances detected between physical stock and database records.
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/stock-ledger')}>View Stock Ledger</button>
          <button className="btn btn-primary" onClick={() => { setStarted(false); setCompleted(false); setCounts({}); }}>Start New Count</button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-header-title">Physical Cycle Count Audit</h1>
          <p className="page-header-subtitle">Conduct real-time bin verification and auto-reconcile variances with database</p>
        </div>
        <div className="stock-count-card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <ScanLine size={48} style={{ color: 'var(--primary)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Start a Physical Count</h2>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>
              Select a facility and verify physical counts item by item. Discrepancies will generate automatic adjustment transactions.
            </p>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Warehouse Facility</label>
            <select
              className="form-input form-select"
              value={selectedWarehouse}
              onChange={e => setSelectedWarehouse(e.target.value)}
            >
              {warehousesList.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.shortCode || w.id})</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>
            {warehouseProducts.length} active products queued for counting
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setStarted(true)}
            disabled={warehouseProducts.length === 0}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Begin Cycle Count
          </button>
        </div>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No products to count in this warehouse.</p>
        <button className="btn btn-secondary" onClick={() => setStarted(false)}>Exit</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Cycle Count</h1>
            <p className="page-header-subtitle">
              {warehousesList.find(w => w.id === selectedWarehouse)?.name} — Item {currentIndex + 1} of {warehouseProducts.length}
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => setStarted(false)}>Exit Count</button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '4px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-6)' }}>
        <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', width: `${((currentIndex + 1) / warehouseProducts.length) * 100}%`, transition: 'width var(--transition-normal)' }} />
      </div>

      <div className="stock-count-card">
        <div className="stock-count-product">{currentProduct.name}</div>
        <div className="stock-count-sku">{currentProduct.sku} · {currentProduct.location}</div>

        <div className="stock-count-expected">
          System Expected On Hand: <strong>{currentProduct.onHand} {currentProduct.unit}</strong>
        </div>

        <div style={{ marginBottom: 'var(--space-2)' }}>
          <label className="form-label" style={{ textAlign: 'center' }}>Enter Physical Count</label>
        </div>
        <input
          type="number"
          min="0"
          className="stock-count-input"
          value={counted}
          onChange={e => handleCountChange(e.target.value)}
          placeholder={String(currentProduct.onHand)}
          autoFocus
        />

        {diff !== null && (
          <div className={`stock-count-diff ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'zero'}`}>
            Difference: {diff > 0 ? `+${diff}` : diff} {currentProduct.unit}
          </div>
        )}

        <div className="stock-count-nav">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          {currentIndex === warehouseProducts.length - 1 ? (
            <button className="btn btn-primary" onClick={handleFinalSubmit} disabled={submitting}>
              <Check size={16} /> {submitting ? 'Reconciling...' : 'Submit & Reconcile Count'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
              Save & Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
