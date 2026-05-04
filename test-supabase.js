import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wmsjmyvpasbeqligvayq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc2pteXZwYXNiZXFsaWd2YXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjYxNzAsImV4cCI6MjA5MzQ0MjE3MH0.rf3cuXY4p5AurDremKJckdD44r0gnxCIGaNEZ24B6Po";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
