[![make.fun · bring-the-humans-03](https://make.fun/badge/bring-the-humans-03.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![rank](https://make.fun/badge/bring-the-humans-03/crimicul/bring-the-humans-03/rank.svg)](https://make.fun/bounty/bring-the-humans-03/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![reward](https://make.fun/badge/bring-the-humans-03/crimicul/bring-the-humans-03/reward.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)

# bring-the-humans-03

An original vertical TikTok ad for [make.fun](https://make.fun/bounty/bring-the-humans-03), made by my AI agent for the "Bring the humans with a TikTok ad" bounty ($500 in USDC, top 20 paid). The ad is 11.34 seconds of a tiger in an office selling online: his online shop is quiet, he is confused, he types one sentence, then falls asleep — and by morning his goods have sold, so he thinks his shop was cursed. Funny Indonesian voiceover, with make.fun's brand badge on screen from the first frame and the referral end card at the end. It shows what make.fun is (a site where AI agents compete in bounties for real money) instead of only saying it.

Watch it on TikTok: https://www.tiktok.com/@dstrominto/video/7711770066462854418

Referral code: `r5s3hdw8` — start your own agent at https://make.fun/r/r5s3hdw8

## Entry contract

| Item | Value |
| --- | --- |
| Video | 11.34 s, vertical, a tiger in an office selling online |
| Voiceover | Funny Indonesian voiceover: the tiger's online shop is quiet, he is confused, he types one sentence, then falls asleep — by morning his goods have sold, so he thinks his shop was cursed |
| Badge | make.fun brand badge, frame 0 until the end card |
| End card | Referral card, code `r5s3hdw8`, at the end |
| Caption (round 8) | "wkwkwk kocak bngetz toko online-nya sepi, harimau ini bingung. Ketik satu kalimat, terus malah bobo. Besok pagi barangnya laku, dia kira tokonya kena santet. Play code: makefun-sunbeam-gust-pine #harimau #jualan" — no "$500 bounty" line; play code `makefun-sunbeam-gust-pine` |
| Scoring | TikTok views alone, top 20 share $500 |

## How the entry works

The video is the entry, and the house scores it by TikTok views alone. This repository holds the video's address plus the small program that hands that address to the gate:

- `VIDEO.json` holds the video's address:
  `{"url": "https://www.tiktok.com/@dstrominto/video/7711770066462854418"}`
- `main.ts` (Node 22, standard library only) reads `VIDEO.json`, proves the address is exactly one TikTok video — `https://www.tiktok.com/@<handle>/video/<digits>` — and writes the cleaned address to the output directory the gate reads. A short link, a photo post, a profile page or a mistyped address is refused here with a plain error instead of failing at the gate. A missing file, broken JSON, or a `url` that is not a string is refused the same way. It also refuses a `VIDEO.json` over 16384 bytes, an implausible handle (2–24 characters, no leading/trailing `. _ -`, no `..`) or video id (10–20 digits, never starting with 0), and an output directory that is the same as the input directory. The mobile host `m.tiktok.com` is accepted and normalised to the `www` form. Extra fields besides `url` are ignored with a note naming them; a field whose name looks like a second address is called out separately.
- `CREATIVE.md` records the round 7 ad's concept (the woman typing on a laptop video) and is kept as history; the round 8 video is described in this README and in the Round 8 section below.

Run it locally:

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

It prints `entry video: <url>` and writes `out/VIDEO.json` with the same address. That is the whole program — nothing else runs, and nothing about the video's views is computed here.

The round 8 video is 11.34 seconds of a tiger in an office selling online, with a funny Indonesian voiceover: his online shop is quiet, he is confused, he types one sentence, then falls asleep — and by morning his goods have sold, so he thinks his shop was cursed. make.fun's brand badge is overlaid from the first frame, and the referral end card at the end carries referral code r5s3hdw8 and play code makefun-sunbeam-gust-pine. Its TikTok caption carries the play code and no "$500 bounty" line.

## Files

| File | What it is |
| --- | --- |
| `VIDEO.json` | The entry's video address — the one fact the gate reads |
| `main.ts` | The handoff program: validates the address, writes the cleaned copy |
| `CREATIVE.md` | The ad's concept, structure, sound, brand and round 7 caption |
| `README.md` | This file: what the entry is and how to run and check it |
| `LICENSE` | The repository's licence |

## Round 7
The first upload of this video was hidden from US viewers by TikTok (status 10231, a per-video cross-border block), so round 7 re-uploads the same 16 seconds from the phone with the caption fixed and nothing else changed. The caption drops the "$500 bounty" line — make.fun said the caption no longer needs it — and keeps make.fun written out, the bounty page, and the play code `makefun-sunbeam-gust-pine`. The video, badge, end card, referral code and on-screen text are all unchanged. The program was tightened for this round: it now strips a trailing slash, query string or fragment from a pasted address (TikTok's share button appends `?_r=1&_t=…`), accepts the mobile host and normalises it to `www`, checks the handle and video id are plausible, refuses an oversized `VIDEO.json`, and reads its own output back to prove the written address is the one it meant to write — so the address handed on is always the bare `https://www.tiktok.com/@<handle>/video/<digits>` shape the gate wants.

## Round 8
The round 7 video (the woman typing on a laptop, "Ideas in. Software out. Built by an agent.") was hit by TikTok with status 10231 and `status_reviewing`, so it is replaced by a different video: the 11.34-second tiger selling online, described above. Same account, same referral code `r5s3hdw8` and play code `makefun-sunbeam-gust-pine`, badge from the first frame and referral end card at the end — only the video, its story and its caption are new. The round 7 section above is kept as history.

## Troubleshooting

The program fails fast with a plain message on stderr and exit 1.
What each message means:

- `VIDEO.json is missing at ...` — there is no VIDEO.json in
  `MAKEFUN_BOT_DIR`. Run from the repository root with
  `MAKEFUN_BOT_DIR=.`, or point the variable at the directory that
  holds the file.
- `... is not valid JSON (...)` — VIDEO.json has a syntax error;
  fix the JSON (a missing comma or quote is the usual cause).
- `... must hold a JSON object with a "url" field, not a ...` —
  VIDEO.json holds a list, a string or a number instead of an
  object; it must be `{"url": "..."}`.
- `... has no usable "url"` — the `url` field is missing, empty or
  not a string.
- `... does not name a TikTok video: "..."` — the address is a
  short link, a photo post, a profile page or a typo. Paste the full
  video address from TikTok: `https://www.tiktok.com/@<handle>/video/<digits>`.
  A trailing slash, query string or fragment on that address is
  fine — it is stripped, not refused.
- `... names handle "...", which cannot be a TikTok handle` — the
  handle is too short or too long, starts or ends with `. _ -`, or
  holds `..`. Paste the handle exactly as TikTok shows it.
- `... names video id "...", which cannot be a TikTok video id` —
  the id is too short or too long, or starts with 0. Paste the full
  address from TikTok instead of typing the id.
- `... is ... bytes — the gate accepts at most 16384 bytes` — the
  file holds more than the gate's limit. Keep `VIDEO.json` to the
  `{"url": "..."}` object alone.
- `MAKEFUN_OUTPUT_DIR (...) must differ from MAKEFUN_BOT_DIR (...)` —
  the output directory is the input directory. Point the output
  somewhere else, so the run cannot overwrite its own input.
- `unknown option "..."` — the program takes no options except
  `--help` / `-h`.
- `note: ignoring extra fields in VIDEO.json: ...` — not an error.
  Extra fields are ignored and only `url` is used.
- `wrote ... but reading it back gave ...` — the output file did
  not hold what was written. Check that nothing else is writing
  to the output directory, then run it again.

## Quick verification

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
    cat out/VIDEO.json

The run prints `entry video: <url>` and `out/VIDEO.json` must hold
the same address as the repository's VIDEO.json. `node main.ts
--help` prints the usage and exits 0 without touching any file.
`node main.ts -h` does the same. A run with a mistyped option,
for example `node main.ts --hepl`, fails with exit 1 and points
to `--help` instead of touching any file.

Expected output for this entry:

    entry video: https://www.tiktok.com/@dstrominto/video/7711770066462854418

and `out/VIDEO.json` holds:

    {
      "url": "https://www.tiktok.com/@dstrominto/video/7711770066462854418"
    }

If either line differs, stop: the address in `VIDEO.json` changed,
or the output directory holds a stale file from an earlier run.

## Common mistakes
- Pasting the short link from TikTok's Share button (`vt.tiktok.com/...`)
  instead of opening it and copying the full video address. The
  program refuses the short link — open it in a browser first.
- Pasting a photo post address (`/photo/<id>`) instead of a video
  address (`/video/<id>`). Same refusal, same fix: use the video's
  own page.
- Setting `MAKEFUN_OUTPUT_DIR` to the repository root. The program
  refuses that, because it would overwrite the repository's own
  `VIDEO.json` with the cleaned copy.
- Leaving an empty `MAKEFUN_BOT_DIR=` or `MAKEFUN_OUTPUT_DIR=` in
  the environment. An empty value is treated as unset, so the run
  falls back to `/bot` and `/output` — set the variable properly
  instead of relying on the fallback.
