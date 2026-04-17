import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

export const getDb = () => {
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   const repoRoot = path.resolve(__dirname, '..', '..');
   const localDbPath = path.join(repoRoot, 'local.db');
   const localDbUrl = `file:${localDbPath.replace(/\\/g, '/')}`;

   return createClient({
      url: process.env.TURSO_DATABASE_URL || localDbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
   });
};
