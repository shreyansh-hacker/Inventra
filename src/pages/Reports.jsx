import React from 'react'
import {
  BarChart3, TrendingUp, TrendingDown, Package, Warehouse,
  ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, Activity, Zap
} from 'lucide-react'

const reports = [
  { title: 'Stock Valuation', desc: 'Current value of all inventory by product, category, and warehouse.', icon: BarChart3, color: 'var(--info-50)', iconColor: 'var(--info-500)' },
  { title: 'Inventory Movement', desc: 'All stock movements over a period — receipts, deliveries, transfers, adjustments.', icon: Activity, color: 'var(--primary-50)', iconColor: 'var(--primary)' },
  { title: 'Low Stock Report', desc: 'Products at or below reorder point, ranked by urgency.', icon: TrendingDown, color: 'var(--danger-50)', iconColor: 'var(--danger-500)' },
  { title: 'Warehouse Utilization', desc: 'Capacity usage across warehouses, zones, and racks.', icon: Warehouse, color: 'var(--success-50)', iconColor: 'var(--success-500)' },
  { title: 'Receipts Summary', desc: 'All incoming stock — complete, partial, and overdue receipts.', icon: ArrowDownToLine, color: 'var(--success-50)', iconColor: 'var(--success-600)' },
  { title: 'Deliveries Summary', desc: 'Outgoing deliveries — fulfillment rate, delays, and shortages.', icon: ArrowUpFromLine, color: '#f5f3ff', iconColor: '#8b5cf6' },
  { title: 'Adjustments Log', desc: 'All stock adjustments with reasons, differences, and responsible users.', icon: SlidersHorizontal, color: 'var(--warning-50)', iconColor: 'var(--warning-600)' },
  { title: 'Fast Moving Products', desc: 'Products with highest movement frequency and consumption rate.', icon: Zap, color: 'var(--primary-50)', iconColor: 'var(--primary)' },
  { title: 'Slow Moving Products', desc: 'Products with minimal movement — candidates for clearance or review.', icon: Package, color: 'var(--gray-100)', iconColor: 'var(--gray-500)' },
]

export default function Reports() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Reports</h1>
            <p className="page-header-subtitle">Generate and export inventory reports</p>
          </div>
          <div className="page-header-actions">
            <select className="filter-btn form-select" style={{ cursor: 'pointer' }}>
              <option>All Warehouses</option>
              <option>Main Warehouse</option>
              <option>Distribution Center</option>
            </select>
            <input type="date" className="form-input" style={{ width: 'auto', height: '36px' }} defaultValue="2026-09-26" />
          </div>
        </div>
      </div>

      <div className="report-grid">
        {reports.map(report => (
          <div key={report.title} className="report-card">
            <div className="report-card-icon" style={{ background: report.color, color: report.iconColor }}>
              <report.icon size={22} />
            </div>
            <div className="report-card-title">{report.title}</div>
            <div className="report-card-desc">{report.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
