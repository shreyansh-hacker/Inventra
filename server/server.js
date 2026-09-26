import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureSeedData } from './seed/initSeed.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Serve frontend build from the same server in production.
import express from 'express';
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`🚀 INVENTRA server running on http://localhost:${PORT}`);
  // Ensure database has base catalog records
  await ensureSeedData();
});
