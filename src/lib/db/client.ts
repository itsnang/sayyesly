import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env, requireEnv } from "@/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

// Reuse one connection pool across dev hot reloads instead of opening a new one per reload.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres>; drizzleDb?: Db };

function connect(): Db {
  if (globalForDb.drizzleDb) return globalForDb.drizzleDb;
  const client = globalForDb.pgClient ?? postgres(requireEnv("DATABASE_URL"), { max: 10 });
  const instance = drizzle(client, { schema });
  if (env.NODE_ENV !== "production") globalForDb.pgClient = client;
  globalForDb.drizzleDb = instance;
  return instance;
}

// Created on first use, not on import, so `next build` works without DATABASE_URL.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = connect();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
