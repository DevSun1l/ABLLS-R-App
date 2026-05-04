import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase environment variables are missing.');
    // Fallback dummy client
    const dummyQuery = () => ({
      select: dummyQuery,
      eq: dummyQuery,
      ilike: dummyQuery,
      order: dummyQuery,
      limit: dummyQuery,
      single: async () => ({ data: null, error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
      then: (resolve) => resolve({ data: null, error: null }),
    });

    supabase = { 
      from: dummyQuery, 
      auth: { 
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), 
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: async () => {}
      } 
    };
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (err) {
  console.error('CRITICAL: Failed to initialize Supabase client:', err);
  supabase = { from: () => ({}), auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getSession: async () => ({ data: { session: null } }) } };
}

export { supabase };
