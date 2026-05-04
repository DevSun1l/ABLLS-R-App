import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userId = 'd9c31d92-daf4-414b-97ca-5255b29eac0e';

async function test() {
  console.log('Testing single user query for ID:', userId);
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('Query finished in', Date.now() - start, 'ms');
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Data:', data);
    }
  } catch (e) {
    console.error('Thrown error:', e);
  }
}

test();
