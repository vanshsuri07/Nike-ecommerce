import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '../lib/db/schema';
import * as dotenv from 'dotenv';
import ws from 'ws';

dotenv.config({ path: '.env' });

// Configure WebSocket for persistent connection
neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.DATABASE_URL!, {
  ssl: true,
});
export const db = drizzle(sql, { schema });
export { schema };
