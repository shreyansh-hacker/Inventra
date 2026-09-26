import React, { useState, useEffect } from 'react'
import { Warehouse, ChevronRight, ChevronDown, MapPin, Package, RefreshCw } from 'lucide-react'
import api from '../services/api.js'

export default function InventoryMap() {
  const [mapData, setMapData] = useState(null)
  const [selectedRack, setSelectedRack] = useState(null)
  const [expandedZones, setExpandedZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadMap = async () => {
    try {
      const res = await api.inventoryMap.get()
      if (res.success && res.data) {
        setMapData(res.data)
        const allZoneIds = res.data.zones?.map(z => z.id) || []
        setExpandedZones(allZoneIds)
        if (!selectedRack && res.data.zones?.[0]?.racks?.[0]) {
          setSelectedRack(res.data.zones[0].racks[0])
        }
      }
    } catch (err) {
      console.error('Failed to load inventory map:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMap()
  }, [])

  const toggleZone = (zoneId) => {
    setExpandedZones(prev => prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId])
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading warehouse layout and physical bin occupancy from database...
      </div>
    )
  }

  const warehouseName = mapData?.name || 'Main Warehouse (WH-A)'
  const zones = mapData?.zones || []
  const rackProducts = selectedRack?.products || []
  const capacity = selectedRack?.capacity || 300
  const used = selectedRack?.used || 0
  const usagePercent = Math.min(100, Math.round((used / capacity) * 100))

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">Live Interactive Inventory Map</h1>
            <p className="page-header-subtitle">
              Visual physical topology: Warehouse → Zone → Rack → Shelf → Bin level custody
            </p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setRefreshing(true); loadMap(); }} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh Map</span>
            </button>
            <select className="filter-btn form-select" style={{ cursor: 'pointer' }}>
              <option>Main Warehouse (WH-A) — Central Facility</option>
              <option>Regional Facility (WH-B) — Site B</option>
            </select>
          </div>
        </div>
      </div>

      <div className="map-layout">
        {/* Tree Hierarchy */}
        <div className="map-tree">
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)', padding: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Warehouse size={16} style={{ color: 'var(--primary)' }} />
              {warehouseName}
            </div>
          </div>
          {zones.map(zone => (
            <div key={zone.id}>
              <div className="tree-item" onClick={() => toggleZone(zone.id)} style={{ fontWeight: 500 }}>
                {expandedZones.includes(zone.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <MapPin size={14} className="tree-item-icon" />
                {zone.name}
              </div>
              {expandedZones.includes(zone.id) && (
                <div className="tree-children">
                  {zone.racks?.map(rack => (
                    <div
                      key={rack.id}
                      className={`tree-item${selectedRack?.id === rack.id ? ' active' : ''}`}
                      onClick={() => setSelectedRack(rack)}
                    >
                      <Package size={14} className="tree-item-icon" />
                      {rack.name}
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-quaternary)' }}>
                        {rack.productsCount || rack.products?.length || 0} items
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Visual Grid Layout */}
        <div className="map-visual">
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
            Warehouse Operational Layout — {warehouseName}
          </div>
          <div className="map-grid">
            {zones.flatMap(zone =>
              zone.racks?.map(rack => {
                const cellUsed = rack.used || 0
                const cellCap = rack.capacity || 300
                const cellPct = Math.round((cellUsed / cellCap) * 100)
                const rackHealth = rack.health || (cellPct > 100 ? 'overstock' : cellPct > 0 ? 'healthy' : 'watch')

                return (
                  <div
                    key={rack.id}
                    className={`map-cell ${rackHealth}${selectedRack?.id === rack.id ? ' active' : ''}`}
                    onClick={() => setSelectedRack(rack)}
                  >
                    <div className="map-cell-label">{rack.name.replace('Rack ', '').replace('Dock ', 'D-')}</div>
                    <div className="map-cell-count">{rack.productsCount || rack.products?.length || 0} items</div>
                    <div className="map-cell-count font-semibold">{cellPct}%</div>
                  </div>
                )
              })
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', justifyContent: 'center', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--success-50)', border: '1px solid var(--success-500)' }} /> Healthy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--warning-50)', border: '1px solid var(--warning-500)' }} /> Watch / Risk</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--danger-50)', border: '1px solid var(--danger-500)' }} /> Depleted</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f5f3ff', border: '1px solid #8b5cf6' }} /> Overstock / Heavy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--gray-50)', border: '1px solid var(--gray-300)' }} /> Available</span>
          </div>
        </div>

        {/* Selected Rack / Bin Detail Panel */}
        {selectedRack ? (
          <div className="map-detail">
            <div className="map-detail-header">
              <div className="map-detail-title">{selectedRack.name}</div>
              <div className="map-detail-path">
                {warehouseName} → {zones.find(z => z.racks?.some(r => r.id === selectedRack.id))?.name} → {selectedRack.code || selectedRack.name}
              </div>
            </div>

            <div className="map-detail-stats">
              <div className="map-stat">
                <div className="map-stat-value">{capacity}</div>
                <div className="map-stat-label">Capacity</div>
              </div>
              <div className="map-stat">
                <div className="map-stat-value">{used}</div>
                <div className="map-stat-label">Occupied</div>
              </div>
              <div className="map-stat">
                <div className="map-stat-value">{Math.max(0, capacity - used)}</div>
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
              Stock in Bin ({rackProducts.length})
            </div>

            {rackProducts.length > 0 ? rackProducts.map((p, i) => (
              <div key={p.productId || i} style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className="product-icon" style={{ width: '32px', height: '32px' }}><Package size={14} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{p.name || p.productName}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.sku}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{p.onHand} {p.unit}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.available} available</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
                No product inventory physically stored in this rack bin.
              </div>
            )}
          </div>
        ) : (
          <div className="map-detail" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Select a rack from the map or tree to view physical custody details.
          </div>
        )}
      </div>
    </div>
  )
}
