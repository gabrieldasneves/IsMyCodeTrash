// ─── OG Image Component ───────────────────────────────────────────────────────
// Mirrors the "Screen 4 - OG Image" frame from devroast.pen exactly.
// Design tokens:
//   bg-page      : #0A0A0A
//   text-primary : #FAFAFA
//   text-tertiary: #4B5563
//   accent-amber : #F59E0B  (score number)
//   accent-red   : #EF4444  (verdict dot + text when needs_serious_help/needs_help)
//   accent-green : #10B981  (logo > prompt)

interface OgImageProps {
	score: number;
	verdict: string;
	language: string;
	lineCount: number;
	roastQuote: string;
}

function verdictColor(verdict: string): string {
	switch (verdict) {
		case "needs_serious_help":
		case "needs_help":
			return "#EF4444";
		case "mediocre":
			return "#F59E0B";
		case "acceptable":
			return "#3B82F6";
		case "excellent":
			return "#10B981";
		default:
			return "#6B7280";
	}
}

export function OgImage({
	score,
	verdict,
	language,
	lineCount,
	roastQuote,
}: OgImageProps) {
	const dotColor = verdictColor(verdict);
	const scoreInt = Math.floor(score);
	const scoreDecimal = Math.round((score - scoreInt) * 10);
	const scoreDisplay =
		scoreDecimal > 0 ? `${scoreInt}.${scoreDecimal}` : `${scoreInt}`;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				backgroundColor: "#0A0A0A",
				padding: "64px",
				gap: "28px",
				fontFamily: '"JetBrains Mono", monospace',
			}}
		>
			{/* Logo Row */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					gap: "8px",
				}}
			>
				<span
					style={{
						color: "#10B981",
						fontSize: "24px",
						fontWeight: 700,
						lineHeight: 1,
					}}
				>
					&gt;
				</span>
				<span
					style={{
						color: "#FAFAFA",
						fontSize: "20px",
						fontWeight: 500,
						lineHeight: 1,
					}}
				>
					devroast
				</span>
			</div>

			{/* Score Row */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "flex-end",
					justifyContent: "center",
					gap: "4px",
				}}
			>
				<span
					style={{
						color: "#F59E0B",
						fontSize: "160px",
						fontWeight: 900,
						lineHeight: 1,
					}}
				>
					{scoreDisplay}
				</span>
				<span
					style={{
						color: "#4B5563",
						fontSize: "56px",
						fontWeight: 400,
						lineHeight: 1,
					}}
				>
					/10
				</span>
			</div>

			{/* Verdict Row */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					gap: "8px",
				}}
			>
				<div
					style={{
						width: "12px",
						height: "12px",
						borderRadius: "50%",
						backgroundColor: dotColor,
					}}
				/>
				<span
					style={{
						color: dotColor,
						fontSize: "20px",
						fontWeight: 400,
					}}
				>
					{verdict}
				</span>
			</div>

			{/* Lang Info */}
			<span
				style={{
					color: "#4B5563",
					fontSize: "16px",
					fontWeight: 400,
					fontFamily: '"JetBrains Mono", monospace',
				}}
			>
				lang: {language} · {lineCount} {lineCount === 1 ? "line" : "lines"}
			</span>

			{/* Roast Quote */}
			<div
				style={{
					color: "#FAFAFA",
					fontSize: "22px",
					fontWeight: 400,
					textAlign: "center",
					lineHeight: 1.5,
					maxWidth: "900px",
					fontFamily: '"JetBrains Mono", monospace',
				}}
			>
				&ldquo;{roastQuote}&rdquo;
			</div>
		</div>
	);
}
