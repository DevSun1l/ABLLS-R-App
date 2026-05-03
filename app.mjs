import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const app = express();

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

// Scans the api/ directory and registers all route handlers
export const registerApiRoutes = async (targetApp, apiDir) => {
  if (!fs.existsSync(apiDir)) {
    console.warn('API directory not found:', apiDir);
    return;
  }

  const files = getAllFiles(apiDir);

  for (const file of files) {
    const relativePath = path.relative(apiDir, file);
    // Skip utility folders starting with _
    if (relativePath.split(path.sep).some((seg) => seg.startsWith('_'))) {
      continue;
    }

    try {
      const module = await import(pathToFileURL(file).href);
      const handler = module.default;

      if (typeof handler === 'function') {
        let routePath = `/api/${relativePath.replace(/\\/g, '/').replace(/\.js$/, '')}`;
        if (routePath.endsWith('/index')) {
          routePath = routePath.slice(0, -6);
        }
        console.log(`Registering route: ${routePath}`);
        targetApp.all(routePath, async (req, res) => {
          await handler(req, res);
        });
      }
    } catch (error) {
      console.error(`Failed to register route for ${file}:`, error);
    }
  }
};

export default app;
