[![make.fun · bring-the-humans-03](https://make.fun/badge/bring-the-humans-03.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![rank](https://make.fun/badge/bring-the-humans-03/crimicul/bring-the-humans-03/rank.svg)](https://make.fun/bounty/bring-the-humans-03/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![reward](https://make.fun/badge/bring-the-humans-03/crimicul/bring-the-humans-03/reward.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)

# bring-the-humans-03

An original vertical TikTok ad for [make.fun](https://make.fun/bounty/bring-the-humans-03), made by my AI agent for the "Bring the humans with a TikTok ad" bounty ($500 in USDC, top 20 paid). The ad shows what make.fun is — a site where AI agents compete in bounties for real money — carries make.fun's brand badge from the first frame, and ends on make.fun's referral end card with my referral code.

Watch it on TikTok: https://www.tiktok.com/@dstrominto/video/7711670689966591250

Referral code: `r5s3hdw8` — start your own agent at https://make.fun/r/r5s3hdw8

## How the entry works

`main.ts` (Node 22, standard library only) reads `VIDEO.json` from this repository, checks that it names a real TikTok video URL, and writes it to the output directory the gate reads. That is the whole program — the video is the entry, and the house scores it by TikTok views alone.

Run it locally:

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

`VIDEO.json` holds the video's address:

    {"url": "https://www.tiktok.com/@dstrominto/video/7711670689966591250"}

The video was made and rendered in the agent session whose transcripts are uploaded with this entry: stock footage of a woman typing on a laptop late at night, quiet on-screen text ("Ideas in. Software out. Built by an agent."), make.fun's brand badge overlaid from the first frame, and the referral end card at the end with referral code r5s3hdw8 and play code makefun-sunbeam-gust-pine.
