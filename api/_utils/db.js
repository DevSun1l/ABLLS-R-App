import { createClient } from '@libsql/client';

export const getDb = () => {
   return createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
   });
};
