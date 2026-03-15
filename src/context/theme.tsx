"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
	return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "devroast-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("dark");

	// Read from localStorage on mount (client only)
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored === "light" || stored === "dark") {
			setTheme(stored);
		}
	}, []);

	// Apply class to <html> whenever theme changes
	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("dark", "light");
		root.classList.add(theme);
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}
