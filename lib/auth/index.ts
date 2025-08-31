import { betterAuth } from 'better-auth';
import { db, schema } from '../../src/db';

export const auth = betterAuth({
  db,
  schema,
});
