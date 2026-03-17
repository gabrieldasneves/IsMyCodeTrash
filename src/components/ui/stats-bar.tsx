"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

interface StatsBarProps {
	totalRoasts: number;
	averageScore: number | null;
}

export function StatsBar({ totalRoasts, averageScore }: StatsBarProps) {
	// Inicia em 0 e anima para o valor real após o mount no cliente
	const [total, setTotal] = useState(0);
	const [avg, setAvg] = useState(0);

	useEffect(() => {
		setTotal(totalRoasts);
		if (averageScore !== null) setAvg(averageScore);
	}, [totalRoasts, averageScore]);

	return (
		<div className="flex w-full max-w-[780px] items-center justify-center gap-6 pt-2">
			<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
				<NumberFlow
					value={total}
					format={{ useGrouping: true }}
					className="font-sans text-xs text-[var(--color-text-tertiary)] tabular-nums"
					transformTiming={{ duration: 900, easing: "ease-out" }}
					spinTiming={{ duration: 900, easing: "ease-out" }}
				/>{" "}
				codes roasted
			</span>

			<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
				·
			</span>

			<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
				avg score:{" "}
				{averageScore === null ? (
					"—"
				) : (
					<NumberFlow
						value={avg}
						format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
						className="font-sans text-xs text-[var(--color-text-tertiary)] tabular-nums"
						transformTiming={{ duration: 900, easing: "ease-out" }}
						spinTiming={{ duration: 900, easing: "ease-out" }}
					/>
				)}
				{averageScore !== null && "/10"}
			</span>
		</div>
	);
}
