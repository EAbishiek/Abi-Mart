import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { getDb, resetDatabase } from './server/db';
import { authController } from './server/controllers/authController';
import { productController } from './server/controllers/productController';
import { cartController } from './server/controllers/cartController';
import { orderController } from './server/controllers/orderController';
import { reviewController } from './server/controllers/reviewController';

async function startServer() {
  const app = express();
  const initialPort = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Warmup Database & Run Migrations
  await getDb();

  // API Routes Versioned under /api/v1/... (Section 11 requirement)

  // 1. Health Check Endpoint (Section 16 requirement)
  app.get('/api/v1/health', async (req, res) => {
    try {
      const db = await getDb();
      const testRes = db.exec('SELECT 1 as ping');
      const dbStatus = testRes[0]?.values[0]?.[0] === 1 ? 'UP' : 'DOWN';

      return res.status(200).json({
        success: true,
        data: {
          status: 'UP',
          db: dbStatus,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
        },
        error: null,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        data: {
          status: 'DEGRADED',
          db: 'DOWN',
          timestamp: new Date().toISOString(),
        },
        error: {
          code: 'DATABASE_ERROR',
          message: err.message || 'Database connectivity test failed.',
        },
      });
    }
  });

  // 2. Authentication API Endpoints (Requirement F1)
  app.post('/api/v1/auth/register', (req, res) => authController.register(req, res));
  app.post('/api/v1/auth/login', (req, res) => authController.login(req, res));
  app.get('/api/v1/auth/me', (req, res) => authController.me(req, res));
  app.post('/api/v1/auth/logout', (req, res) => authController.logout(req, res));
  app.get('/api/v1/users', (req, res) => authController.getUsers(req, res));

  // 3. Products Catalog Endpoints (Gaming Gear Storefront)
  app.get('/api/v1/products', (req, res) => productController.getProducts(req, res));
  app.get('/api/v1/products/:id', (req, res) => productController.getProduct(req, res));
  app.post('/api/v1/products', (req, res) => productController.createProduct(req, res));
  app.put('/api/v1/products/:id', (req, res) => productController.updateProduct(req, res));
  app.delete('/api/v1/products/:id', (req, res) => productController.deleteProduct(req, res));

  // 4. Product Reviews Endpoints
  app.get('/api/v1/products/:id/reviews', (req, res) => reviewController.getReviews(req, res));
  app.post('/api/v1/products/:id/reviews', (req, res) => reviewController.createReview(req, res));

  // 5. Persistent Shopping Cart Endpoints
  app.get('/api/v1/cart', (req, res) => cartController.getCart(req, res));
  app.post('/api/v1/cart/items', (req, res) => cartController.addItem(req, res));
  app.put('/api/v1/cart/items/:productId', (req, res) => cartController.updateQuantity(req, res));
  app.delete('/api/v1/cart/items/:productId', (req, res) => cartController.removeItem(req, res));
  app.post('/api/v1/cart/clear', (req, res) => cartController.clearCart(req, res));
  app.post('/api/v1/cart/sync', (req, res) => cartController.syncCart(req, res));

  // 6. Orders & Checkout Endpoints
  app.post('/api/v1/orders/checkout', (req, res) => orderController.checkout(req, res));
  app.get('/api/v1/orders', (req, res) => orderController.getOrders(req, res));
  app.get('/api/v1/orders/:id', (req, res) => orderController.getOrder(req, res));
  app.patch('/api/v1/orders/:id/status', (req, res) => orderController.updateStatus(req, res));

  // 7. Database Inspector & Schema Migrations Endpoint
  app.get('/api/v1/db/inspector', async (req, res) => {
    try {
      const db = await getDb();

      // Fetch Applied Migrations
      const migStmt = db.prepare('SELECT id, name, applied_at FROM schema_migrations ORDER BY id ASC');
      const migrations: any[] = [];
      while (migStmt.step()) {
        migrations.push(migStmt.getAsObject());
      }
      migStmt.free();

      // Fetch All Tables
      const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const tableNames = tablesRes[0]?.values.map(v => v[0] as string) || [];

      const tables: any[] = [];
      for (const tName of tableNames) {
        const infoRes = db.exec(`PRAGMA table_info("${tName}")`);
        const columns = infoRes[0]?.values.map(row => ({
          cid: row[0],
          name: row[1],
          type: row[2],
          notnull: row[3],
          dflt_value: row[4],
          pk: row[5],
        })) || [];

        const countRes = db.exec(`SELECT COUNT(*) as count FROM "${tName}"`);
        const rowCount = (countRes[0]?.values[0]?.[0] as number) || 0;

        tables.push({
          name: tName,
          columns,
          rowCount,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          tables,
          migrations,
          totalTables: tables.length,
        },
        error: null,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INSPECTOR_ERROR',
          message: err.message || 'Failed to inspect database schema.',
        },
      });
    }
  });

  // 8. Re-seed / Reset Database Endpoint
  app.post('/api/v1/db/reset', async (req, res) => {
    try {
      resetDatabase();
      await getDb(); // Reinitialize and re-run all migrations & seeds
      return res.status(200).json({
        success: true,
        data: { message: 'Database successfully reinitialized with latest seed catalog.' },
        error: null,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'RESET_ERROR', message: err.message || 'Failed to reset database.' },
      });
    }
  });

  // Vite middleware for development vs static production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  function bindServer(portToTry: number) {
    const server = app.listen(portToTry, '0.0.0.0', () => {
      console.log(`[AbiMart Backend] Gaming Accessories Capstone server listening at http://localhost:${portToTry}`);
      console.log(`[AbiMart Backend] Alternative local URL: http://127.0.0.1:${portToTry}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[AbiMart Backend] Port ${portToTry} is occupied. Attempting next available port: ${portToTry + 1}...`);
        bindServer(portToTry + 1);
      } else {
        console.error('[AbiMart Backend] Server error:', err);
      }
    });
  }

  bindServer(initialPort);
}

startServer().catch(err => {
  console.error('[Fatal Server Startup Error]:', err);
});
