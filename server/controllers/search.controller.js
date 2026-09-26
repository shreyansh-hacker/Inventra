import prisma from '../lib/prisma.js';

export async function globalSearch(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const query = q.trim();

    const [products, receipts, deliveries, transfers, locations] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { barcode: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.receipt.findMany({
        where: { reference: { contains: query } },
        take: 5
      }),
      prisma.delivery.findMany({
        where: { reference: { contains: query } },
        take: 5
      }),
      prisma.transfer.findMany({
        where: { reference: { contains: query } },
        take: 5
      }),
      prisma.location.findMany({
        where: {
          OR: [
            { code: { contains: query } },
            { rack: { contains: query } },
            { zone: { contains: query } }
          ]
        },
        include: { warehouse: true },
        take: 5
      }),
    ]);

    const results = [
      ...products.map(p => ({
        type: 'product',
        title: p.name,
        subtitle: `SKU: ${p.sku} · Barcode: ${p.barcode}`,
        url: `/products/${p.id}`,
      })),
      ...receipts.map(r => ({
        type: 'receipt',
        title: `Receipt ${r.reference}`,
        subtitle: `Inbound receipt (${r.status})`,
        url: `/receipts/${r.id}`,
      })),
      ...deliveries.map(d => ({
        type: 'delivery',
        title: `Delivery ${d.reference}`,
        subtitle: `Outbound delivery (${d.status})`,
        url: `/deliveries/${d.id}`,
      })),
      ...transfers.map(t => ({
        type: 'transfer',
        title: `Transfer ${t.reference}`,
        subtitle: `Internal transfer (${t.status})`,
        url: `/transfers`,
      })),
      ...locations.map(l => ({
        type: 'location',
        title: `${l.warehouse?.name} — ${l.rack}`,
        subtitle: `Location code: ${l.code}`,
        url: `/inventory-map`,
      })),
    ];

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
