import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from '../../db/index' // adjust if no TS alias

import { user, session, account, verifications} from "../../lib/db/schema";


export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verifications },
  }),
  user: {
    modelName: "user",
  },
  advanced: {
    generateId: () => crypto.randomUUID(), // Generate proper UUIDs
  },
  emailAndPassword: {
    enabled: true,
  },
});