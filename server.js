import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app, { registerApiRoutes } from './app.mjs';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const startServer = async () => {
  const apiDir = path.join(__dirname, 'api');
  await registerApiRoutes(app, apiDir);

  // In production (Railway), serve the built React frontend from dist/
  if (IS_PRODUCTION) {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      const { default: express } = await import('express');
      app.use(express.static(distPath));
      // SPA fallback: serve index.html for any non-API route
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('Serving static files from dist/');
    } else {
      console.warn('dist/ folder not found. Run `npm run build` first.');
    }
  }

  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT} [${IS_PRODUCTION ? 'production' : 'development'}]`
    );
  });
};

startServer();
