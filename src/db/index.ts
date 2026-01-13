import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Local Supabase defaults (bunx supabase start)
const DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export const client = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export * from "./schema";
