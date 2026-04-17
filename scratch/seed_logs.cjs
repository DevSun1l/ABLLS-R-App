const { createClient } = require('@libsql/client');
require('dotenv').config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function seed() {
  try {
    const users = await db.execute('SELECT id, created_at FROM users');
    let seeded = 0;
    
    for (const u of users.rows) {
      const check = await db.execute({
        sql: "SELECT id FROM activity_logs WHERE user_id = ? AND action = 'login' LIMIT 1",
        args: [u.id]
      });
      
      if (check.rows.length === 0) {
        await db.execute({
          sql: "INSERT INTO activity_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)",
          args: [u.id, 'login', JSON.stringify({ message: 'Initial registration log' }), u.created_at]
        });
        seeded++;
      }
    }
    console.log(`Seeded initial logs for ${seeded} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
