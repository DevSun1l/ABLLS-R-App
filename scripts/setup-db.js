import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const localDbPath = resolve(process.cwd(), 'local.db').replace(/\\/g, '/');
const url = process.env.TURSO_DATABASE_URL || `file:${localDbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function setup() {
  console.log("Connecting to Database at", url);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'therapist',
      org_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age_years INTEGER,
      age_months INTEGER,
      diagnoses TEXT,
      notes TEXT,
      org_id TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      assessor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      domain_data TEXT, 
      smart_goals TEXT,
      status TEXT DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (assessor_id) REFERENCES users(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Tables created correctly.");

  // Seeding default users (Admin & Therapist)
  const tx = await db.transaction('write');
  
  try {
     const checkAdmin = await tx.execute("SELECT id FROM users WHERE email = 'admin@cognifycareteam.com'");
     if (checkAdmin.rows.length === 0) {
        console.log("Seeding Admin User...");
        const adminHash = await bcrypt.hash('987654321', 10);
        await tx.execute({
           sql: "INSERT INTO organizations (id, name) VALUES (?, ?)",
           args: ['org_admin', 'Cognify Care Admin']
        });
        await tx.execute({
           sql: `INSERT INTO users (id, email, password_hash, first_name, last_name, role, org_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
           args: ['usr_admin', 'admin@cognifycareteam.com', adminHash, 'System', 'Administrator', 'admin', 'org_admin']
        });
     }

     const checkUser = await tx.execute("SELECT id FROM users WHERE email = 'mnm@cognifycareteam.com'");
     if (checkUser.rows.length === 0) {
        console.log("Seeding Specialist User...");
        const userHash = await bcrypt.hash('123456789', 10);
        await tx.execute({
           sql: "INSERT INTO organizations (id, name) VALUES (?, ?)",
           args: ['org_demo', 'Cognify Assessment Center']
        });
        await tx.execute({
           sql: `INSERT INTO users (id, email, password_hash, first_name, last_name, role, org_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
           args: ['usr_specialist', 'mnm@cognifycareteam.com', userHash, 'Demo', 'Therapist', 'therapist', 'org_demo']
        });
     }

     await tx.commit();
     console.log("Default accounts verified and seeded successfully!");
  } catch (err) {
     console.error("Failed to seed:", err);
     await tx.rollback();
  }

  process.exit(0);
}

setup();
