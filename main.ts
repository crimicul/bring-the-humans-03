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
//
// Two input spellings are accepted and then normalised to that one
// canonical shape: the desktop host (www.tiktok.com) and the mobile
// host (m.tiktok.com). Both name the same video, and the output is
// always the www form, so the gate never sees a second spelling.
//
// Two habits keep a last-minute entry from failing silently. First,
// the program says so on stderr whenever it normalises an address:
// a pasted address that needed cleaning is named next to the clean
// address it became, so the log shows the change instead of hiding
// it. Second, --check-only validates the address and prints it
// without writing anything, so a pre-submit check never has to
// touch the output directory to prove the address is good.
//
// A third habit is for scripts that call this program: --json makes
// the success output machine-readable. With it, the program prints
// one JSON object on stdout — the cleaned address, whether the run
// was check-only, and the handle and video id it validated — and
// keeps every note and error on stderr, so the JSON on stdout stays
// parseable even when an address needed normalising. Without --json
// the output is the plain human line this file has always printed,
// so existing runs and logs do not change.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The gate's own limit, from the bounty rules: VIDEO.json is a JSON
// object of at most 16384 bytes. Refusing an oversized file here,
// with its size in the message, is cheaper than failing at the gate.
const MAX_VIDEO_JSON_BYTES = 16384;

// A video address, and nothing else. The handle may hold letters,
// digits, dots, underscores and hyphens; the id is digits only. A
// trailing slash, a query string or a fragment — the ?_r=1&_t=…
// TikTok's own share button appends — is tolerated and then dropped,
// so the address handed on is always the bare video address.
// The match is case-insensitive on the scheme and host only in
// effect: a pasted address with an uppercase host (HTTPS://WWW.…)
// is still the same video, and the output is always the lowercase
// canonical form, so a copy-paste casing slip never changes the
// entry. The handle itself keeps its original casing.
const TIKTOK_VIDEO_URL =
  /^https:\/\/(?:www|m)\.tiktok\.com\/@([A-Za-z0-9._-]+)\/video\/(\d+)\/?(?:[?#].*)?$/i;

// TikTok handles are 2–24 characters, may not start or end with a
// dot, underscore or hyphen, and may not hold two dots in a row.
// They also may not hold two separator characters in a row at all
// (a "..", "__", "--", "._", "_.", "-_" or "_-" pair): a handle
// with a doubled separator is a paste error, not a handle, and it
// is refused here instead of being handed to the gate. The video
// id is 10–20 digits and never starts with 0. These checks catch
// pasted addresses that match the regex's shape but could never be
// a real TikTok handle or video id.
function handleIsPlausible(handle) {
  if (handle.length < 2 || handle.length > 24) return false;
  if (/^[._-]/.test(handle) || /[._-]$/.test(handle)) return false;
  if (handle.includes('..')) return false;
  if (/[._-]{2}/.test(handle)) return false;
  return true;
}

function videoIdIsPlausible(videoId) {
  if (videoId.length < 10 || videoId.length > 20) return false;
  if (videoId.startsWith('0')) return false;
  return true;
}

// The result this program reports on success, in one place, so the
// human line and the JSON line can never disagree about the address:
// both are built from the same cleaned address, handle and video id.
// The JSON form carries check_only so a caller can tell a dry
// validation from a run that wrote the output file, and it carries
// the handle and video id so a script can check them without
// parsing the address back out of a sentence.
function formatResult(cleanUrl, handle, videoId, checkOnly, asJson) {
  if (asJson) {
    return JSON.stringify({ url: cleanUrl, handle, video_id: videoId, check_only: checkOnly });
  }
  if (checkOnly) {
    return `entry video: ${cleanUrl} (check only — nothing written)`;
  }
  return `entry video: ${cleanUrl}`;
}

// Usage text, printed by --help / -h. It states the whole contract
// in one place: what the program reads, what it accepts, what it
// writes, and what exit code means what — so nobody has to read the
// code to run the entry.
const USAGE = `bring-the-humans-03 entry — hands the TikTok video address to the gate.

Usage:
  MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
  node main.ts --help   (or -h)
  node main.ts --check-only   (validate only, write nothing)
  node main.ts --json   (print the result as one JSON object)
  node main.ts --check-only --json   (validate only, JSON result)

The program reads VIDEO.json from MAKEFUN_BOT_DIR (default /bot),
checks it names exactly one public TikTok video, and writes the
cleaned address to MAKEFUN_OUTPUT_DIR/VIDEO.json (default /output).

Accepted address shape:
  https://www.tiktok.com/@<handle>/video/<digits>
The mobile host m.tiktok.com is accepted too and normalised to www.
A trailing slash, query string or fragment is tolerated and dropped.
When the pasted address needed that cleaning, the program says so
on stderr, naming the pasted address and the clean one it became.
Refused: short links, photo posts, profile pages, anything else.
Handle: 2-24 characters, no leading/trailing . _ -, no ".." and no
doubled separator such as "__" or "._".
Video id: 10-20 digits, never starting with 0.
VIDEO.json itself: at most 16384 bytes.

VIDEO.json may hold extra fields besides "url" — they are ignored
with a note on stderr, and only "url" is used. An extra field whose
name looks like a second address (it holds "url" or "video") is
named separately in that note, so a second address pasted under
another key is visible instead of vanishing.

--check-only runs every check above, prints the cleaned address,
and exits 0 without creating or replacing any output file. Use it
for a pre-submit check when the output directory must stay
untouched, for example right before bundling the entry.

--json prints the result as one JSON object on stdout instead of
the human line: {"url": ..., "handle": ..., "video_id": ...,
"check_only": true/false}. Notes and errors still go to stderr,
so the JSON stays parseable. Combine it with --check-only for a
scripted pre-submit check that reads the address from JSON and
writes nothing.

Exit codes: 0 on success, 1 on any error (the reason on stderr).`;

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// Flags are read first, so --help works even when VIDEO.json is
// absent, and a mistyped flag fails here with a pointer to --help
// instead of being mistaken for a file problem.
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
// --check-only and --json are the two flags besides --help / -h
// that the program takes: both are filtered out of the
// unknown-option check below. --check-only is read again after
// validation, where it stops the run before anything is written;
// --json only changes how the success line is printed, never
// whether the run writes.
const checkOnly = args.includes('--check-only');
const asJson = args.includes('--json');
const unknownOption = args
  .filter((arg) => arg !== '--check-only' && arg !== '--json')
  .find((arg) => arg.startsWith('-'));
if (unknownOption !== undefined) {
  fail(
    `unknown option ${JSON.stringify(unknownOption)} — this program ` +
      `takes no options except --help / -h, --check-only and --json; run "node main.ts --help" for usage`,
  );
}

// An empty environment variable is treated as unset, so
// MAKEFUN_BOT_DIR= (empty) does not become a lookup in the
// current directory's parent or a write to a nameless folder.
const botDir = process.env.MAKEFUN_BOT_DIR?.trim() ? process.env.MAKEFUN_BOT_DIR.trim() : '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR?.trim() ? process.env.MAKEFUN_OUTPUT_DIR.trim() : '/output';
const sourcePath = join(botDir, 'VIDEO.json');

// Writing the output into the same directory as the source would
// overwrite the repository's own VIDEO.json with the cleaned copy.
// That is refused outright, before anything is read, so a run can
// never destroy its own input. --check-only never writes, so it is
// allowed even when the two directories are the same: the check
// itself is still useful, and nothing is at risk.
if (!checkOnly && resolve(botDir) === resolve(outDir)) {
  fail(
    `MAKEFUN_OUTPUT_DIR (${outDir}) must differ from MAKEFUN_BOT_DIR (${botDir}) — ` +
      `writing the output there would overwrite the repository's own VIDEO.json`,
  );
}

if (!existsSync(sourcePath)) {
  fail(
    `VIDEO.json is missing at ${sourcePath} — the repository must hold ` +
      `VIDEO.json at its root with {"url": "https://www.tiktok.com/@<handle>/video/<id>"}`,
  );
}

// The size check runs before parsing, so a file over the gate's
// 16384-byte limit fails with its size stated, not with a
// misleading JSON error.
const sourceSize = statSync(sourcePath).size;
if (sourceSize > MAX_VIDEO_JSON_BYTES) {
  fail(
    `VIDEO.json at ${sourcePath} is ${sourceSize} bytes — the gate ` +
      `accepts at most ${MAX_VIDEO_JSON_BYTES} bytes`,
  );
}

let parsed;
try {
  // A byte-order mark at the start of the file (some editors add
  // one) is stripped before parsing, so a valid file is not
  // refused for an invisible first character.
  const rawText = readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
  parsed = JSON.parse(rawText);
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

// Extra fields are ignored on purpose, but never silently: the note
// names them in sorted order, so a field added by mistake (a title,
// a view count, a second address under another key) is visible
// instead of vanishing. A field whose name suggests it holds an
// address is called out on its own line, because that is the one
// mistake that would silently change which video is entered.
const extraFields = Object.keys(parsed).filter((key) => key !== 'url').sort();
if (extraFields.length > 0) {
  console.error(
    `main.ts: note: ignoring extra fields in VIDEO.json: ${extraFields.join(', ')} — only "url" is used`,
  );
  const addressLike = extraFields.filter((key) => /url|video/i.test(key));
  if (addressLike.length > 0) {
    console.error(
      `main.ts: note: ${addressLike.join(', ')} look(s) like a second address field — ignored; only "url" is used`,
    );
  }
}

const url = parsed.url.trim();
// A space inside the address is never part of a TikTok address —
// it means two things were pasted together, or a line break crept
// in. That gets its own error, so the failure names the cause
// instead of the generic "does not name a TikTok video".
if (/\s/.test(url)) {
  fail(
    `VIDEO.json at ${sourcePath} holds an address with whitespace inside it: ${JSON.stringify(url)} — ` +
      `paste one address only, with no spaces or line breaks`,
  );
}
const match = TIKTOK_VIDEO_URL.exec(url);
if (match === null) {
  fail(
    `VIDEO.json at ${sourcePath} does not name a TikTok video: ${JSON.stringify(url)} — ` +
      `expected https://www.tiktok.com/@<handle>/video/<digits> (a short link, a photo ` +
      `post or a profile page is not a video address)`,
  );
}

const [, handle, videoId] = match;
if (!handleIsPlausible(handle)) {
  fail(
    `VIDEO.json at ${sourcePath} names handle ${JSON.stringify(handle)}, which cannot be a TikTok handle — ` +
      `handles are 2-24 characters, may not start or end with . _ -, and may not hold ".." or a doubled separator`,
  );
}
if (!videoIdIsPlausible(videoId)) {
  fail(
    `VIDEO.json at ${sourcePath} names video id ${JSON.stringify(videoId)}, which cannot be a TikTok video id — ` +
      `ids are 10-20 digits and never start with 0`,
  );
}

// The output is always the canonical www form, even when the input
// used the mobile host, so the gate always sees the same shape.
const cleanUrl = `https://www.tiktok.com/@${handle}/video/${videoId}`;

// Say so when the pasted address needed cleaning, so the log shows
// the change: a mobile host, a trailing slash, a query string or a
// fragment that was dropped is named here, next to the clean
// address it became, instead of vanishing silently.
if (url !== cleanUrl) {
  console.error(`main.ts: note: normalised ${JSON.stringify(url)} to ${JSON.stringify(cleanUrl)}`);
}

// Self-check the cleaned address against the same pattern before
// writing it. If the cleaning step ever produced a shape the
// validator would refuse, the run fails here instead of writing a
// file the gate would reject.
if (TIKTOK_VIDEO_URL.exec(cleanUrl) === null) {
  fail(`internal error: cleaned address ${JSON.stringify(cleanUrl)} does not match the TikTok video shape`);
}

// --check-only stops here: every check has passed, the address is
// printed, and no output file is created or replaced. A pre-submit
// check run this way proves the address without touching the
// output directory at all.
if (checkOnly) {
  console.error(
    `main.ts: note: check only — handle ${JSON.stringify(handle)}, video id ${videoId}, nothing written`,
  );
  console.log(formatResult(cleanUrl, handle, videoId, true, asJson));
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'VIDEO.json');
// Say so when an earlier output file is about to be replaced, so
// a stale file from a previous run is never mistaken for this
// run's result when the log is read later.
if (existsSync(outPath)) {
  console.error(`main.ts: note: replacing existing ${outPath} with this run's address`);
}
writeFileSync(outPath, JSON.stringify({ url: cleanUrl }, null, 2) + '\n');

// Read the file back and prove it holds exactly what was meant to
// be written. A write that silently landed elsewhere, or a
// directory that another process shares, fails here with a plain
// message instead of handing the gate a file nobody checked.
let writtenBack;
try {
  writtenBack = JSON.parse(readFileSync(outPath, 'utf8'));
} catch (error) {
  fail(`wrote ${outPath} but could not read it back (${error.message})`);
}
if (writtenBack?.url !== cleanUrl) {
  fail(
    `wrote ${outPath} but reading it back gave ${JSON.stringify(writtenBack?.url)} ` +
      `instead of ${JSON.stringify(cleanUrl)} — the output was not verified`,
  );
}
console.log(formatResult(cleanUrl, handle, videoId, false, asJson));
