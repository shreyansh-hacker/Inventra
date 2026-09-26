import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDownToLine, Printer, X, Check, AlertTriangle } from 'lucide-react'
import { receipts } from '../data/demoData.js'

const statusOrder = ['draft', 'waiting', 'ready', 'received', 'done']
const statusLabels = { draft: 'Draft', waiting: 'Waiting', ready: 'Ready', received: 'Received', done: 'Done', canceled: 'Canceled' }

export default function ReceiptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const receipt = receipts.find(r => r.id === id) || receipts[0]
  const currentIdx = statusOrder.indexOf(receipt.status)

  return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/receipts')} style={{ marginLeft: '-8px' }}>
        <ArrowLeft size={16} /> Back to Receipts
      </button>

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
        <div className="page-header-actions">
          {receipt.status !== 'done' && receipt.status !== 'canceled' && (
            <button className="btn btn-success"><Check size={14} /> Validate</button>
          )}
          <button className="btn btn-secondary"><Printer size={14} /> Print</button>
          {receipt.status === 'draft' && (
            <button className="btn btn-danger"><X size={14} /> Cancel</button>
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
              ['Destination', receipt.destination],
              ['Schedule Date', receipt.scheduleDate],
              ['Responsible', receipt.responsible],
              ['Created', receipt.createdAt],
              ['Completed', receipt.completedAt || '—'],
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
            <div className="card-header"><div className="card-title">Notes</div></div>
            <div className="card-body">
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{receipt.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Products</div></div>
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
                {receipt.items.map((item, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{item.product}</td>
                    <td className="text-right">{item.expected} {item.unit}</td>
                    <td className="text-right font-semibold">{item.received} {item.unit}</td>
                    <td className={`text-right font-semibold ${item.difference < 0 ? 'amount-negative' : item.difference > 0 ? 'amount-positive' : ''}`}>
                      {item.difference > 0 && '+'}{item.difference} {item.unit}
                    </td>
                    <td>
                      {item.difference < 0 && item.received > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--warning-600)' }}>
                          <AlertTriangle size={12} /> Short receipt
                        </span>
                      ) : item.difference === 0 && item.received > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--success-600)' }}>
                          <Check size={12} /> Complete
                        </span>
                      ) : (
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-quaternary)' }}>Pending</span>
                      )}
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
