import { drizzle as drizzlePostgres, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import * as schema from "./schema";

// Production uses DATABASE_URL (Neon / any Postgres).
// Without it, local development falls back to an embedded PGlite database in ./.pglite.
// Both drivers expose the same query API; type them as one so callers get a single signature.
type Db = PostgresJsDatabase<typeof schema>;

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (url) {
    return drizzlePostgres(postgres(url, { prepare: false }), { schema });
  }
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set");
  }
  return drizzlePglite(process.env.PGLITE_DIR ?? ".pglite", { schema }) as unknown as Db;
}

// One client per process, created on first query: survives hot reloads, is shared by
// proxy.ts and the app, and isn't opened by build workers that merely import this module
// (PGlite must never open the same directory twice).
const globalForDb = globalThis as unknown as { db?: Db };
const getDb = () => (globalForDb.db ??= createDb());

export const db = new Proxy({} as Db, {
  get: (_, prop) => Reflect.get(getDb(), prop),
});
