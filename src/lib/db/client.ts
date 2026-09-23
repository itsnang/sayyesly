import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

// Reuse one connection pool across dev hot reloads instead of opening a new one per reload.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };
const client = globalForDb.pgClient ?? postgres(env.DATABASE_URL, { max: 10 });
if (env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db: Db = drizzle(client, { schema });
