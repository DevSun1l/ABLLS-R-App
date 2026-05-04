import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const tables = ['organizations', 'users', 'students', 'assessments', 'activity_logs', 'notifications', 'feedback'];
  console.log('--- Checking Supabase Database Tables ---');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      if (error.code === '42P01') {
        console.log(`[MISSING] Table "${table}" does not exist.`);
      } else {
        console.log(`[ERROR] Table "${table}": ${error.message} (Code: ${error.code})`);
      }
    } else {
      console.log(`[OK] Table "${table}" exists.`);
    }
  }
}

checkTables();
