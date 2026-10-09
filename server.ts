import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { authRouter } from './server/routes/auth.js';
import { publicRouter } from './server/routes/public.js';
import { donorRouter } from './server/routes/donor.js';
import { hospitalRouter } from './server/routes/hospital.js';
import { adminRouter } from './server/routes/admin.js';
import { connectMongoDB } from './server/models/connect.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Smart Blood Connect',
    timestamp: new Date().toISOString()
  });
});

// Postman API Docs endpoint
app.get('/api/docs/postman', (req, res) => {
  const postmanPath = path.resolve(__dirname, 'server/postman.json');
  if (fs.existsSync(postmanPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="smart_blood_connect_postman_collection.json"');
    return res.sendFile(postmanPath);
  }
  return res.status(404).json({ error: 'Postman collection file not found' });
});

// Mount API Routers
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/donor', donorRouter);
app.use('/api/hospital', hospitalRouter);
app.use('/api/admin', adminRouter);

async function startServer() {
  // Connect to MongoDB Atlas if URI is provided
  await connectMongoDB();

  // Initialize Database & Seed
  await db.init();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Blood Connect] Full-Stack server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
