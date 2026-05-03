import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TURSO_URL = 'libsql://cognify-devsun1l.aws-ap-south-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc4MDM2NzEsImlkIjoiMDE5ZGVkNWEtNjYwMS03ZDcyLThlNmYtOTYzNDU2N2JhZWJkIiwicmlkIjoiMjBjMDk5NTEtMGFmNS00MTNhLWJiZjEtYmQ0NzcyMTAxZjY1In0.SaZXWtnS24l1biafrehLKQm_EwQ9tqf1_OENemttJrBPHFWKwi-DE3wfOFTDVMtVwu9tkfmblewFDyC7_c3oDg';

const localDbPath = path.join(__dirname, 'local.db');
const localDbUrl = `file:${localDbPath.replace(/\\/g, '/')}`;

const localDb = createClient({ url: localDbUrl });
const tursoDb = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function migrate() {
  console.log('Connecting to local.db...');

  // Get all table definitions
  const tablesResult = await localDb.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );

  const tables = tablesResult.rows;
  console.log(`Found ${tables.length} tables: ${tables.map(t => t.name).join(', ')}\n`);

  for (const table of tables) {
    const tableName = table.name;
    const createSql = table.sql;

    console.log(`--- Migrating table: ${tableName} ---`);

    // Drop and recreate table in Turso
    try {
      await tursoDb.execute(`DROP TABLE IF EXISTS "${tableName}"`);
      console.log(`  Dropped existing table (if any)`);
    } catch (e) {
      console.warn(`  Warning dropping table: ${e.message}`);
    }

    try {
      await tursoDb.execute(createSql);
      console.log(`  Created table`);
    } catch (e) {
      console.error(`  ERROR creating table: ${e.message}`);
      continue;
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
        console.warn(`  Warning inserting row: ${e.message}`);
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
