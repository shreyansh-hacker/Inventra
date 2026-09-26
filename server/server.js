import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureSeedData } from './seed/initSeed.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import productRoutes from './routes/product.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import adjustmentRoutes from './routes/adjustment.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import locationRoutes from './routes/location.routes.js';
import alertRoutes from './routes/alert.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'INVENTRA Enterprise Core',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api', ledgerRoutes);
app.use('/api', locationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/search', searchRoutes);

// Serve frontend build from the same server in production.
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 INVENTRA server running on http://localhost:${PORT}`);
  // Ensure database has base catalog records
  await ensureSeedData();
});
