"use client";

import { useState } from "react";
import { submitRoast } from "@/app/actions/roast";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Toggle } from "@/components/ui/toggle";

// ─── Component ───────────────────────────────────────────────────────────────

export function RoastForm() {
	const [code, setCode] = useState("");
	const [overLimit, setOverLimit] = useState(false);

	const submitDisabled = !code.trim() || overLimit;

	return (
		<form action={submitRoast} className="flex flex-col gap-4">
			<CodeEditor
				name="code"
				placeholder="// paste your code here..."
				className="w-full max-w-[780px]"
				onChange={setCode}
				onLimitChange={setOverLimit}
			/>

			{/* Actions Bar */}
			<div className="flex w-full max-w-[780px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Toggle name="roastMode" label="roast mode" defaultChecked />
					<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
						{"// maximum sarcasm enabled"}
					</span>
				</div>
				<Button
					type="submit"
					variant="primary"
					size="md"
					disabled={submitDisabled}
					className="w-full sm:w-auto"
				>
					$ roast_my_code
				</Button>
			</div>
		</form>
	);
}
