import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpFromLine, Printer, Check, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '../services/api.js'

const statusOrder = ['draft', 'waiting', 'ready', 'picking', 'packed', 'delivered', 'done']
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

export default function DeliveryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const loadDelivery = async () => {
    try {
      const res = await api.deliveries.getById(id)
      if (res.success && res.data) {
        setDelivery(res.data)
      }
    } catch (err) {
      console.error('Error loading delivery detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDelivery()
  }, [id])

  const handleValidate = async () => {
    if (!window.confirm('Validate this delivery? Stock will be physically decremented from the warehouse location and an immutable stock ledger entry will be recorded.')) {
      return
    }

    setValidating(true)
    setActionError('')
    setActionSuccess('')

    try {
      const res = await api.deliveries.validate(id, { validateAll: true })
      if (res.success) {
        setActionSuccess('Delivery successfully validated! Warehouse inventory decremented and ledger entry created.')
        await loadDelivery()
      } else {
        setActionError(res.message || 'Validation failed.')
      }
    } catch (err) {
      setActionError(err.message || 'Failed to validate delivery. Check stock availability.')
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading delivery information from database...
      </div>
    )
  }

  if (!delivery) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Delivery Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Delivery #{id} was not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/deliveries')}>Back to Deliveries</button>
      </div>
    )
  }

  const currentIdx = statusOrder.indexOf(delivery.status) !== -1 ? statusOrder.indexOf(delivery.status) : 0
  const isCompleted = delivery.status === 'delivered' || delivery.status === 'done'

  return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/deliveries')} style={{ marginLeft: '-8px' }}>
        <ArrowLeft size={16} /> Back to Deliveries
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
          <div>
            <strong>Delivery Validation Blocked: </strong>
            <span>{actionError}</span>
          </div>
        </div>
      )}

      <div className="detail-header">
        <div className="detail-title-section">
          <div className="detail-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <ArrowUpFromLine size={24} />
          </div>
          <div>
            <h1 className="detail-title">{delivery.reference}</h1>
            <div className="detail-ref">Delivery to {delivery.customer}</div>
          </div>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
          {!isCompleted && delivery.status !== 'canceled' && (
            <button className="btn btn-success" onClick={handleValidate} disabled={validating}>
              <Check size={14} />
              <span>{validating ? 'Validating Dispatch...' : 'Validate Delivery (Deduct Stock)'}</span>
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
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
              ['Customer', delivery.customer],
              ['Delivery Address', delivery.address],
              ['Origin Warehouse', delivery.warehouse],
              ['Schedule Date', delivery.scheduleDate || 'Today'],
              ['Responsible Officer', delivery.responsible || 'Fulfillment Team'],
              ['Order Created', delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : '—'],
              ['Dispatch Completed', delivery.completedAt ? new Date(delivery.completedAt).toLocaleString() : 'Pending Dispatch'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 'var(--font-sm)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        {delivery.notes && (
          <div className="card">
            <div className="card-header"><div className="card-title">Dispatch & Gate Pass Notes</div></div>
            <div className="card-body">
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{delivery.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Outbound Product Items</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-right">Requested</th>
                  <th className="text-right">Reserved</th>
                  <th className="text-right">Picked</th>
                  <th className="text-right">Packed</th>
                  <th className="text-right">Delivered</th>
                  <th>Availability Status</th>
                </tr>
              </thead>
              <tbody>
                {delivery.items?.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.product}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>SKU: {item.productId}</div>
                    </td>
                    <td className="text-right font-semibold">{item.requested} {item.unit}</td>
                    <td className="text-right">{item.reserved} {item.unit}</td>
                    <td className="text-right">{item.picked} {item.unit}</td>
                    <td className="text-right">{item.packed} {item.unit}</td>
                    <td className="text-right font-semibold">{item.delivered} {item.unit}</td>
                    <td>
                      <span className={`badge badge-${isCompleted ? 'healthy' : 'watch'}`}>
                        <span className="badge-dot" />
                        {isCompleted ? 'Fulfilled' : 'Ready to Dispatch'}
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
