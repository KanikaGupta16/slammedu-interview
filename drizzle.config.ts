import { defineConfig } from "drizzle-kit";

// Local Supabase defaults (bunx supabase start)
const DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
