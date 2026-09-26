import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpFromLine, Printer, Check, AlertTriangle } from 'lucide-react'
import { deliveries } from '../data/demoData.js'

const statusOrder = ['draft', 'waiting', 'ready', 'picking', 'packed', 'delivered', 'done']
const statusLabels = { draft: 'Draft', waiting: 'Waiting', ready: 'Ready', picking: 'Picking', packed: 'Packed', delivered: 'Delivered', done: 'Done' }

export default function DeliveryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const delivery = deliveries.find(d => d.id === id) || deliveries[0]
  const currentIdx = statusOrder.indexOf(delivery.status)

  return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/deliveries')} style={{ marginLeft: '-8px' }}>
        <ArrowLeft size={16} /> Back to Deliveries
      </button>

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
        <div className="page-header-actions">
          {delivery.status !== 'done' && delivery.status !== 'delivered' && (
            <button className="btn btn-success"><Check size={14} /> Validate</button>
          )}
          <button className="btn btn-secondary"><Printer size={14} /> Print</button>
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
              ['Address', delivery.address],
              ['Warehouse', delivery.warehouse],
              ['Schedule Date', delivery.scheduleDate],
              ['Responsible', delivery.responsible],
              ['Created', delivery.createdAt],
              ['Completed', delivery.completedAt || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 'var(--font-sm)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Products</div></div>
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
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {delivery.items.map((item, i) => {
                  const unavailable = item.requested - item.reserved
                  return (
                    <tr key={i}>
                      <td className="font-semibold">{item.product}</td>
                      <td className="text-right">{item.requested} {item.unit}</td>
                      <td className="text-right">{item.reserved} {item.unit}</td>
                      <td className="text-right">{item.picked} {item.unit}</td>
                      <td className="text-right">{item.packed} {item.unit}</td>
                      <td className="text-right font-semibold">{item.delivered} {item.unit}</td>
                      <td>
                        {unavailable > 0 ? (
                          <div style={{ fontSize: 'var(--font-xs)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger-600)' }}>
                              <AlertTriangle size={12} /> {unavailable} {item.unit} unavailable
                            </div>
                            <div style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
                              {item.requested} requested | {item.reserved} available
                            </div>
                          </div>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--success-600)' }}>
                            <Check size={12} /> Fully available
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
