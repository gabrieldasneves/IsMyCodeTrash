import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	casing: "snake_case",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
	verbose: true,
	strict: true,
});
