import { neon } from "@neondatabase/serverless";

/**
 * Create the Neon client only when a database query is executed.
 * Next.js evaluates API route modules during the production build, when
 * Preview environments may not have DATABASE_URL configured.
 */
export function sql(strings: TemplateStringsArray, ...params: any[]) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured for this environment.");
  }

  return neon(connectionString)(strings, ...params);
}
