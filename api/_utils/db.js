import { createClient } from '@supabase/supabase-js';

export const getDb = () => {
   const env = globalThis.process?.env || {};
   
   const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
   const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

   if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your Netlify/Vercel settings.');
   }

   return createClient(supabaseUrl, supabaseAnonKey);
};

// Notification and Admin table checks are no longer needed here as Supabase handles schema via dashboard,
// but we keep the exports as empty functions to avoid breaking imports in other files until they are refactored.
export const ensureNotificationsTable = async (db) => {};
export const ensureAdminAccountsTable = async (db) => {};
