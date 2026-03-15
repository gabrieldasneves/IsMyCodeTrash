"use server";

import { redirect } from "next/navigation";
import { createRoast } from "@/db/queries/roast";

export async function submitRoast(formData: FormData) {
	const code = (formData.get("code") as string | null)?.trim() ?? "";

	if (!code || code.length < 10) {
		// Too short to roast — bounce back silently.
		// Proper validation UI will be added when the editor gains client state.
		return;
	}

	if (code.length > 10_000) {
		return;
	}

	// TODO: replace stub with real AI call once the AI SDK integration is wired up.
	// For now, create a placeholder roast so the DB flow is exercisable end-to-end.
	const roast = await createRoast({
		code,
		language: "plaintext",
		score: 5.0,
		verdict: "mediocre",
		roastQuote: "this code exists. that's about all we can say.",
		issues: [
			{
				severity: "info",
				title: "ai roasting coming soon",
				description:
					"the ai integration is not yet wired up. this is a placeholder roast.",
			},
		],
		suggestedFix: null,
	});

	redirect(`/roast/${roast.slug}`);
}
