import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Helper to recursively find all JS files in a directory
const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
};

// Map files in the api/ directory to Express routes
const registerApiRoutes = async () => {
  const apiDir = path.join(__dirname, 'api');

  if (!fs.existsSync(apiDir)) {
    console.warn('API directory not found.');
    return;
  }

  const files = getAllFiles(apiDir);

  for (const file of files) {
    // Skip utility folders/files starting with _
    const relativePath = path.relative(apiDir, file);
    if (relativePath.split(path.sep).some((segment) => segment.startsWith('_'))) {
      continue;
    }

    try {
      const module = await import(pathToFileURL(file).href);
      const handler = module.default;

      if (typeof handler === 'function') {
        // Construct the route path (e.g. api/auth/login.js -> /api/auth/login)
        let routePath = `/api/${relativePath.replace(/\\/g, '/').replace(/\.js$/, '')}`;

        // Handle index.js files (e.g. api/students/index.js -> /api/students)
        if (routePath.endsWith('/index')) {
          routePath = routePath.slice(0, -6);
        }

        console.log(`Registering route: ${routePath}`);

        app.all(routePath, async (req, res) => {
          await handler(req, res);
        });
      }
    } catch (error) {
      console.error(`Failed to register route for ${file}:`, error);
    }
  }
};

const startServer = async () => {
  await registerApiRoutes();

  // In production, serve the built React frontend from dist/
  if (IS_PRODUCTION) {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
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
