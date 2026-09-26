import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDownToLine, Printer, X, Check, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import api from '../services/api.js'

const statusOrder = ['draft', 'waiting', 'ready', 'received', 'done']
const statusLabels = {
  draft: 'Draft',
  waiting: 'Waiting',
  ready: 'Ready',
  received: 'Received',
  done: 'Done',
  canceled: 'Canceled'
}

export default function ReceiptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const loadReceipt = async () => {
    try {
      const res = await api.receipts.getById(id)
      if (res.success && res.data) {
        setReceipt(res.data)
      }
    } catch (err) {
      console.error('Error loading receipt detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReceipt()
  }, [id])

  const handleValidate = async () => {
    if (!window.confirm('Validate this receipt? Stock will be physically added into the warehouse location and an immutable stock ledger entry will be recorded.')) {
      return
    }

    setValidating(true)
    setActionError('')
    setActionSuccess('')

    try {
      const res = await api.receipts.validate(id, { validateAll: true })
      if (res.success) {
        setActionSuccess('Receipt successfully validated! Warehouse inventory updated and ledger entry created.')
        await loadReceipt()
      } else {
        setActionError(res.message || 'Validation failed.')
      }
    } catch (err) {
      setActionError(err.message || 'Failed to validate receipt.')
    } finally {
      setValidating(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this receipt?')) return
    try {
      await api.receipts.cancel(id)
      loadReceipt()
    } catch (err) {
      setActionError(err.message || 'Failed to cancel receipt.')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading receipt information from database...
      </div>
    )
  }

  if (!receipt) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Receipt Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Receipt #{id} was not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/receipts')}>Back to Receipts</button>
      </div>
    )
  }

  const currentIdx = statusOrder.indexOf(receipt.status) !== -1 ? statusOrder.indexOf(receipt.status) : 0
  const isDone = receipt.status === 'done'

  return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/receipts')} style={{ marginLeft: '-8px' }}>
        <ArrowLeft size={16} /> Back to Receipts
      </button>

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

      <div className="detail-header">
        <div className="detail-title-section">
          <div className="detail-icon" style={{ background: 'var(--success-50)', color: 'var(--success-500)' }}>
            <ArrowDownToLine size={24} />
          </div>
          <div>
            <h1 className="detail-title">{receipt.reference}</h1>
            <div className="detail-ref">Receipt from {receipt.supplier}</div>
          </div>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
          {!isDone && receipt.status !== 'canceled' && (
            <button className="btn btn-success" onClick={handleValidate} disabled={validating}>
              <Check size={14} />
              <span>{validating ? 'Validating Stock...' : 'Validate Receipt (Add to Stock)'}</span>
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          {receipt.status === 'draft' && (
            <button className="btn btn-danger" onClick={handleCancel}>
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status Stepper */}
      <div className="status-stepper">
        {statusOrder.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <div className={`stepper-connector${i <= currentIdx ? ' completed' : ''}`} />}
            <div className={`stepper-step ${i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'pending'}`}>
              {i < currentIdx && <Check size={12} />}
              {statusLabels[step]}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-body">
            {[
              ['Supplier', receipt.supplier],
              ['Warehouse', receipt.warehouse],
              ['Destination Location', receipt.destination],
              ['Schedule Date', receipt.scheduleDate || 'Today'],
              ['Responsible Officer', receipt.responsible || 'Inventory Team'],
              ['Created At', receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : '—'],
              ['Completed At', receipt.completedAt ? new Date(receipt.completedAt).toLocaleString() : 'Pending Validation'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 'var(--font-sm)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        {receipt.notes && (
          <div className="card">
            <div className="card-header"><div className="card-title">Carrier & Inspection Notes</div></div>
            <div className="card-body">
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{receipt.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Inbound Line Items</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-right">Expected</th>
                  <th className="text-right">Received</th>
                  <th className="text-right">Difference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.product}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>SKU: {item.productId}</div>
                    </td>
                    <td className="text-right">{item.expected} {item.unit}</td>
                    <td className="text-right font-semibold">{item.received} {item.unit}</td>
                    <td className="text-right" style={{ color: item.difference !== 0 ? 'var(--danger-600)' : 'inherit' }}>
                      {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                    </td>
                    <td>
                      <span className={`badge badge-${isDone ? 'healthy' : 'watch'}`}>
                        <span className="badge-dot" />
                        {isDone ? 'Received' : 'Pending Physical Count'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
