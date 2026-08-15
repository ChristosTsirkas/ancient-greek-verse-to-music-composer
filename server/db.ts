import 'dotenv/config';
// Postgres connection + Drizzle ORM setup. Everything else in the backend
// imports `db` from here to talk to the database.
import pkg         from "pg";

const { Pool } = pkg;
import {drizzle}   from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : null;

export const db: any = pool
    ? drizzle(pool, { schema })
    : new Proxy({}, {
        get: () => async () => []
    });
