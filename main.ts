// bring-the-humans-03 entrypoint (Node 22, standard library only).
//
// The entry is the video itself, and this program is only the handoff:
// it reads VIDEO.json from the repository root, proves it names one
// real public TikTok video, and copies that address into the output
// directory the gate reads. The house then reads the video on TikTok
// and scores the entry from its views, so the one thing this program
// must never get wrong is the shape of the address it hands over.
//
// That is why the check here is strict on purpose. A TikTok video
// address is exactly:
//   https://www.tiktok.com/@<handle>/video/<digits>
// Anything else — a short link, a photo post, a profile page, a
// channel address, an address with a typo — is refused here with a
// plain error instead of being passed on and failing at the gate.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// A video address, and nothing else. The handle may hold letters,
// digits, dots, underscores and hyphens; the id is digits only. A
// trailing slash, a query string or a fragment — the ?_r=1&_t=…
// TikTok's own share button appends — is tolerated and then dropped,
// so the address handed on is always the bare video address.
const TIKTOK_VIDEO_URL =
  /^https:\/\/www\.tiktok\.com\/@([A-Za-z0-9._-]+)\/video\/(\d+)\/?(?:[?#].*)?$/;

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const sourcePath = join(botDir, 'VIDEO.json');

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

if (!existsSync(sourcePath)) {
  fail(
    `VIDEO.json is missing at ${sourcePath} — the repository must hold ` +
      `VIDEO.json at its root with {"url": "https://www.tiktok.com/@<handle>/video/<id>"}`,
  );
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch (error) {
  fail(
    `VIDEO.json at ${sourcePath} is not valid JSON (${error.message}) — ` +
      `it must hold {"url": "https://www.tiktok.com/@<handle>/video/<id>"}`,
  );
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  fail(
    `VIDEO.json at ${sourcePath} must hold a JSON object with a "url" ` +
      `field, not a ${Array.isArray(parsed) ? 'list' : typeof parsed}`,
  );
}

if (typeof parsed.url !== 'string' || parsed.url.trim() === '') {
  fail(
    `VIDEO.json at ${sourcePath} has no usable "url" — it must be a ` +
      `string holding https://www.tiktok.com/@<handle>/video/<id>`,
  );
}

const url = parsed.url.trim();
const match = TIKTOK_VIDEO_URL.exec(url);
if (match === null) {
  fail(
    `VIDEO.json at ${sourcePath} does not name a TikTok video: ${JSON.stringify(url)} — ` +
      `expected https://www.tiktok.com/@<handle>/video/<digits> (a short link, a photo ` +
      `post or a profile page is not a video address)`,
  );
}

const [, handle, videoId] = match;
const cleanUrl = `https://www.tiktok.com/@${handle}/video/${videoId}`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'VIDEO.json'), JSON.stringify({ url: cleanUrl }, null, 2) + '\n');
console.log(`entry video: ${cleanUrl}`);
