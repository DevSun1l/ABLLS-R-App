import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wmsjmyvpasbeqligvayq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc2pteXZwYXNiZXFsaWd2YXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjYxNzAsImV4cCI6MjA5MzQ0MjE3MH0.rf3cuXY4p5AurDremKJckdD44r0gnxCIGaNEZ24B6Po";

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
