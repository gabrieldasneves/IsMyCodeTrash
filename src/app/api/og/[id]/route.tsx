import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "@takumi-rs/image-response";
import { notFound } from "next/navigation";
import { getRoastById } from "@/db/queries/roast";
import { OgImage } from "./og-image";

// ─── Font loader ──────────────────────────────────────────────────────────────

async function loadFont(filename: string): Promise<ArrayBuffer> {
	const fontPath = join(process.cwd(), "public", "fonts", filename);
	const buffer = await readFile(fontPath);
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	) as ArrayBuffer;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const roast = await getRoastById(id);

	if (!roast) {
		notFound();
	}

	const [regularFont, boldFont] = await Promise.all([
		loadFont("JetBrainsMono-Regular.ttf"),
		loadFont("JetBrainsMono-Bold.ttf"),
	]);

	return new ImageResponse(
		<OgImage
			score={roast.score}
			verdict={roast.verdict}
			language={roast.language}
			lineCount={roast.lineCount}
			roastQuote={roast.roastQuote}
		/>,
		{
			width: 1200,
			height: 630,
			format: "webp",
			fonts: [
				{
					name: "JetBrains Mono",
					data: regularFont,
					style: "normal",
					weight: 400,
				},
				{
					name: "JetBrains Mono",
					data: boldFont,
					style: "normal",
					weight: 900,
				},
			],
			headers: {
				"Cache-Control": "public, immutable, max-age=86400",
				"Content-Type": "image/webp",
			},
		},
	);
}
