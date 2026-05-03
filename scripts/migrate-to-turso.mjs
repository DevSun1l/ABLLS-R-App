import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

const localDbPath = path.join(__dirname, '..', 'local.db');
const localDbUrl = `file:${localDbPath.replace(/\\/g, '/')}`;

const localDb = createClient({ url: localDbUrl });
const tursoDb = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function migrate() {
  console.log('Connecting to local.db...');
  
  // Disable foreign keys to allow dropping/recreating tables with dependencies
  try {
    await tursoDb.execute('PRAGMA foreign_keys = OFF');
  } catch (e) {
    console.warn('Could not disable foreign keys:', e.message);
  }

  // Get all table definitions
  const tablesResult = await localDb.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );

  const tables = tablesResult.rows;
  console.log(`Found ${tables.length} tables: ${tables.map(t => t.name).join(', ')}\n`);

  // Drop tables in dependency order
  const dropOrder = [
    'activity_logs', 'admin_accounts', 'assessment_goals', 'assessments', 
    'student_goals', 'feedback', 'notifications', 'usage_stats', 
    'students', 'users', 'organizations'
  ];
  
  console.log('Clearing existing tables in Turso...');
  for (const tableName of dropOrder) {
    try {
      await tursoDb.execute(`DROP TABLE IF EXISTS "${tableName}"`);
    } catch (e) {
      console.warn(`  Warning dropping ${tableName}: ${e.message}`);
    }
  }

  // Define creation order to satisfy foreign keys
  const createOrder = [
    'organizations', 'users', 'students', 'usage_stats', 
    'notifications', 'feedback', 'student_goals', 'assessments', 
    'assessment_goals', 'admin_accounts', 'activity_logs'
  ];

  for (const tableName of createOrder) {
    const table = tables.find(t => t.name === tableName);
    if (!table) continue;
    
    const createSql = table.sql;
    console.log(`--- Migrating table: ${tableName} ---`);

    try {
      await tursoDb.execute(createSql);
      console.log(`  Created table`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log(`  Table already exists, skipping creation`);
      } else {
        console.error(`  ERROR creating table: ${e.message}`);
        continue;
      }
    }

    // Fetch all rows from local
    const rowsResult = await localDb.execute(`SELECT * FROM "${tableName}"`);
    const rows = rowsResult.rows;
    console.log(`  Found ${rows.length} rows`);

    if (rows.length === 0) continue;

    // Get column names from the first row
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const insertSql = `INSERT OR IGNORE INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;

    let inserted = 0;
    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        return val === undefined ? null : val;
      });
      try {
        await tursoDb.execute({ sql: insertSql, args: values });
        inserted++;
      } catch (e) {
        console.warn(`  Warning inserting row into ${tableName}: ${e.message}`);
      }
    }
    console.log(`  Inserted ${inserted}/${rows.length} rows ✓\n`);
  }

  console.log('✅ Migration complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
