// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from '../../db/index' // adjust if no TS alias
import * as schema from "../../lib/db/schema"; // exports user, accounts, etc.

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.users,
      accounts: schema.accounts,
      sessions: schema.sessions,
      verifications: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});
