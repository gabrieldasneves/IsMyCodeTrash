import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Singleton: evita múltiplas conexões durante hot reload em dev
const globalForDb = globalThis as unknown as {
	_pgClient: postgres.Sql | undefined;
};

function createClient() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not set");
	}
	return postgres(process.env.DATABASE_URL, { max: 10 });
}

const client = globalForDb._pgClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
	globalForDb._pgClient = client;
}

// Sem schema passado ao drizzle — não usamos db.query (sem relations)
export const db = drizzle(client, { casing: "snake_case" });
