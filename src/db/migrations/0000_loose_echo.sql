CREATE TYPE "public"."diff_type" AS ENUM('removed', 'added', 'context');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('typescript', 'javascript', 'tsx', 'jsx', 'python', 'go', 'rust', 'java', 'kotlin', 'swift', 'cpp', 'csharp', 'php', 'ruby', 'scala', 'html', 'css', 'scss', 'json', 'yaml', 'sql', 'bash', 'dockerfile', 'markdown', 'graphql', 'prisma', 'vue', 'svelte', 'plaintext');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('critical', 'warning', 'good', 'info');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('excellent', 'acceptable', 'mediocre', 'needs_help', 'needs_serious_help');--> statement-breakpoint
CREATE TABLE "diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"type" "diff_type" NOT NULL,
	"code" text NOT NULL,
	"line_num" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"severity" "severity" NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"order" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "language" DEFAULT 'plaintext' NOT NULL,
	"line_count" integer NOT NULL,
	"score" real NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roast_quote" text NOT NULL,
	"suggested_fix" text,
	"slug" varchar(12) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roasts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "diff_lines" ADD CONSTRAINT "diff_lines_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_issues" ADD CONSTRAINT "roast_issues_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roasts_score_idx" ON "roasts" USING btree ("score");