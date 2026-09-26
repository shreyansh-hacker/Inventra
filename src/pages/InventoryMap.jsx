import React, { useState } from 'react'
import { Warehouse, ChevronRight, ChevronDown, MapPin, Package, Activity } from 'lucide-react'
import { warehouseHierarchy, products } from '../data/demoData.js'

const healthColor = { healthy: 'healthy', watch: 'watch', critical: 'critical', overstock: 'overstock' }

export default function InventoryMap() {
  const [selectedRack, setSelectedRack] = useState(warehouseHierarchy.zones[0].racks[0])
  const [expandedZones, setExpandedZones] = useState(['Z01', 'Z02', 'Z03', 'Z04'])

  const toggleZone = (zoneId) => {
    setExpandedZones(prev => prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId])
  }

  const rackProducts = products.filter(p => p.location.includes(selectedRack.name.replace('Rack ', '').replace('Dock ', '')))
  const usagePercent = Math.round((selectedRack.used / selectedRack.capacity) * 100)

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Inventory Map</h1>
            <p className="page-header-subtitle">Explore inventory by physical location across your warehouses.</p>
          </div>
          <div className="page-header-actions">
            <select className="filter-btn form-select" style={{ cursor: 'pointer' }}>
              <option>Main Warehouse (WH-A)</option>
              <option>Distribution Center (WH-B)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="map-layout">
        {/* Tree */}
        <div className="map-tree">
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)', padding: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Warehouse size={16} style={{ color: 'var(--primary)' }} />
              {warehouseHierarchy.name}
            </div>
          </div>
          {warehouseHierarchy.zones.map(zone => (
            <div key={zone.id}>
              <div className="tree-item" onClick={() => toggleZone(zone.id)} style={{ fontWeight: 500 }}>
                {expandedZones.includes(zone.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <MapPin size={14} className="tree-item-icon" />
                {zone.name}
              </div>
              {expandedZones.includes(zone.id) && (
                <div className="tree-children">
                  {zone.racks.map(rack => (
                    <div key={rack.id} className={`tree-item${selectedRack.id === rack.id ? ' active' : ''}`} onClick={() => setSelectedRack(rack)}>
                      <Package size={14} className="tree-item-icon" />
                      {rack.name}
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-quaternary)' }}>{rack.products} items</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Visual Grid */}
        <div className="map-visual">
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
            Warehouse Layout — {warehouseHierarchy.name}
          </div>
          <div className="map-grid">
            {warehouseHierarchy.zones.flatMap(zone =>
              zone.racks.map(rack => (
                <div
                  key={rack.id}
                  className={`map-cell ${rack.health}${selectedRack.id === rack.id ? ' active' : ''}`}
                  onClick={() => setSelectedRack(rack)}
                >
                  <div className="map-cell-label">{rack.name.replace('Rack ', '').replace('Dock ', 'D-')}</div>
                  <div className="map-cell-count">{rack.products} items</div>
                  <div className="map-cell-count">{Math.round((rack.used / rack.capacity) * 100)}%</div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', justifyContent: 'center', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--success-50)', border: '1px solid var(--success-500)' }} /> Healthy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--warning-50)', border: '1px solid var(--warning-500)' }} /> Watch</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--danger-50)', border: '1px solid var(--danger-500)' }} /> Critical</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f5f3ff', border: '1px solid #8b5cf6' }} /> Overstock</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--gray-50)', border: '1px solid var(--gray-300)' }} /> Empty</span>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="map-detail">
          <div className="map-detail-header">
            <div className="map-detail-title">{selectedRack.name}</div>
            <div className="map-detail-path">
              {warehouseHierarchy.name} → {warehouseHierarchy.zones.find(z => z.racks.some(r => r.id === selectedRack.id))?.name} → {selectedRack.name}
            </div>
          </div>

          <div className="map-detail-stats">
            <div className="map-stat">
              <div className="map-stat-value">{selectedRack.capacity}</div>
              <div className="map-stat-label">Capacity</div>
            </div>
            <div className="map-stat">
              <div className="map-stat-value">{selectedRack.used}</div>
              <div className="map-stat-label">Occupied</div>
            </div>
            <div className="map-stat">
              <div className="map-stat-value">{selectedRack.capacity - selectedRack.used}</div>
              <div className="map-stat-label">Available</div>
            </div>
            <div className="map-stat">
              <div className="map-stat-value" style={{ color: usagePercent > 90 ? 'var(--danger-600)' : usagePercent > 70 ? 'var(--warning-600)' : 'var(--success-600)' }}>
                {usagePercent}%
              </div>
              <div className="map-stat-label">Utilization</div>
            </div>
          </div>

          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
            Products ({rackProducts.length})
          </div>

          {rackProducts.length > 0 ? rackProducts.map(p => (
            <div key={p.id} style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="product-icon" style={{ width: '32px', height: '32px' }}><Package size={14} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.sku}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{p.onHand} {p.unit}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.available} avail</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
              No products stored at this location.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
