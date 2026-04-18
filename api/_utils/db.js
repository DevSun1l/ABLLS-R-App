import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

export const getDb = () => {
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   const repoRoot = path.resolve(__dirname, '..', '..');
   const localDbPath = path.join(repoRoot, 'local.db');
   const localDbUrl = `file:${localDbPath.replace(/\\/g, '/')}`;
   const env = globalThis.process?.env || {};

   return createClient({
      url: env.TURSO_DATABASE_URL || localDbUrl,
      authToken: env.TURSO_AUTH_TOKEN,
   });
};

export const ensureNotificationsTable = async (db) => {
   await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
         id TEXT PRIMARY KEY,
         user_id TEXT NOT NULL,
         type TEXT NOT NULL,
         title TEXT NOT NULL,
         message TEXT NOT NULL,
         details TEXT,
         read_at DATETIME,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id)
      )
   `);
};

export const ensureAdminAccountsTable = async (db) => {
   await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
         source_user_id TEXT PRIMARY KEY,
         admin_user_id TEXT NOT NULL UNIQUE,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (source_user_id) REFERENCES users(id),
         FOREIGN KEY (admin_user_id) REFERENCES users(id)
      )
   `);
};
