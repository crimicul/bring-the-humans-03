// bring-the-humans-03 entrypoint (Node 22, standard library only).
// Job: hand the gate the TikTok address of the entry video.
// It reads VIDEO.json from the repository root, checks that it names a
// real TikTok video URL, and writes the same JSON into the output
// directory the gate reads from. Nothing else is needed: the video
// itself is the entry, and the house scores it from TikTok views.
//
// The video is an original vertical ad for make.fun, posted publicly
// on TikTok, ending on make.fun's referral end card with the entrant's
// own referral code. Its caption carries the bounty line and a play
// code (or the code sits in the account bio).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(botDir, 'VIDEO.json');
const raw = readFileSync(sourcePath, 'utf8');

let video;
try {
  video = JSON.parse(raw);
} catch {
  console.error(`VIDEO.json at ${sourcePath} is not valid JSON`);
  process.exit(1);
}

if (typeof video.url !== 'string' || !video.url.startsWith('https://www.tiktok.com/')) {
  console.error(`VIDEO.json at ${sourcePath} does not name a TikTok video URL`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'VIDEO.json'), JSON.stringify(video, null, 2) + '\n');
console.log(`entry video: ${video.url}`);
