import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { registerApiRoutes } from '../../app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The api/ directory is at the repo root, two levels up from netlify/functions/
const apiDir = path.join(__dirname, '..', '..', 'api');

// Register all routes once (cached across warm invocations)
let initialized = false;
const init = async () => {
  if (!initialized) {
    await registerApiRoutes(app, apiDir);
    initialized = true;
  }
};

export const handler = async (event, context) => {
  await init();
  return serverless(app)(event, context);
};
