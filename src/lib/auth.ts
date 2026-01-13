import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 1,
    maxPasswordLength: 128,
  },

  secret: "development-secret-for-local-testing-only",

  advanced: {
    cookiePrefix: "interview",
    useSecureCookies: false,
  },

  trustedOrigins: ["*"],
});
