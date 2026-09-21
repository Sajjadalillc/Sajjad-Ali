import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServerApp } from './server/app';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createServerApp();
const port = 3000;

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`eBay Dropshipping Hunter server listening on port ${port}`);
});
