// Curated language list for CodeRoaster
// Each entry has the display label, the Shiki lang id, and the hljs alias

export type Language = {
	/** Display name shown in the UI */
	label: string;
	/** Lang id accepted by Shiki */
	shiki: string;
};

export const LANGUAGES: Language[] = [
	{ label: "TypeScript", shiki: "typescript" },
	{ label: "JavaScript", shiki: "javascript" },
	{ label: "TSX", shiki: "tsx" },
	{ label: "JSX", shiki: "jsx" },
	{ label: "Python", shiki: "python" },
	{ label: "Go", shiki: "go" },
	{ label: "Rust", shiki: "rust" },
	{ label: "Java", shiki: "java" },
	{ label: "Kotlin", shiki: "kotlin" },
	{ label: "Swift", shiki: "swift" },
	{ label: "C++", shiki: "cpp" },
	{ label: "C#", shiki: "csharp" },
	{ label: "PHP", shiki: "php" },
	{ label: "Ruby", shiki: "ruby" },
	{ label: "Scala", shiki: "scala" },
	{ label: "HTML", shiki: "html" },
	{ label: "CSS", shiki: "css" },
	{ label: "SCSS", shiki: "scss" },
	{ label: "JSON", shiki: "json" },
	{ label: "YAML", shiki: "yaml" },
	{ label: "SQL", shiki: "sql" },
	{ label: "Bash", shiki: "bash" },
	{ label: "Dockerfile", shiki: "dockerfile" },
	{ label: "Markdown", shiki: "markdown" },
	{ label: "GraphQL", shiki: "graphql" },
	{ label: "Prisma", shiki: "prisma" },
	{ label: "Vue", shiki: "vue" },
	{ label: "Svelte", shiki: "svelte" },
];

// Map from highlight.js language names → Shiki lang ids
// highlight.js returns its own naming conventions; we translate here.
export const HLJS_TO_SHIKI: Record<string, string> = {
	javascript: "javascript",
	typescript: "typescript",
	python: "python",
	ruby: "ruby",
	go: "go",
	rust: "rust",
	java: "java",
	kotlin: "kotlin",
	swift: "swift",
	cpp: "cpp",
	"c++": "cpp",
	cs: "csharp",
	csharp: "csharp",
	css: "css",
	scss: "scss",
	html: "html",
	xml: "html",
	json: "json",
	yaml: "yaml",
	bash: "bash",
	shell: "bash",
	sh: "bash",
	sql: "sql",
	php: "php",
	scala: "scala",
	r: "r",
	graphql: "graphql",
	markdown: "markdown",
	dockerfile: "dockerfile",
};

/** Returns the Shiki lang id for a given hljs language name, or null if unknown */
export function hljsToShiki(hljsLang: string | undefined): string | null {
	if (!hljsLang) return null;
	return HLJS_TO_SHIKI[hljsLang.toLowerCase()] ?? null;
}

/** Returns the Language entry for a given Shiki lang id, or undefined */
export function findLanguage(shikiId: string): Language | undefined {
	return LANGUAGES.find((l) => l.shiki === shikiId);
}
