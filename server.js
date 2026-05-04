import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app, { registerApiRoutes } from './app.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const startServer = async () => {
  const apiDir = path.join(__dirname, 'api');
  await registerApiRoutes(app, apiDir);

  // Serve the built React frontend from dist/
  const distPath = path.join(__dirname, 'dist');
  
  if (fs.existsSync(distPath)) {
    const { default: express } = await import('express');
    app.use(express.static(distPath));
    
    // API 404 handler
    app.all(/^\/api\/.*/, (req, res) => {
      res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
    });

    // SPA fallback: serve index.html for any non-API route
    app.get(/^((?!\/api\/).)*$/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static files from dist/');
  } else {
    console.warn('dist/ folder not found. Running in API-only mode or waiting for build.');
    
    app.get('/', (req, res) => {
      res.send('API is running. Frontend not found in dist/. Run `npm run build` to unify.');
    });
  }

  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT} [Unified App]`
    );
  });
};

startServer();
