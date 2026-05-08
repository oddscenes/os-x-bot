# Odd Scenes X Bot

A configurable TypeScript template for running an automated X account that can search relevant posts, decide what action to take, generate short-form copy with OpenAI, and post through the official X API.

This started as a personal bot codebase and has been cleaned up into a reusable starter for niche accounts, brand accounts, project bots, and lightweight AI-assisted social workflows.

## What It Does

- Searches recent X posts through TwitterAPI.io using topics from `src/config.ts`.
- Scores candidate posts by engagement and freshness.
- Chooses between reply, repost, quote tweet, original post, or ignore in `src/strategies/chooseAction.ts`.
- Generates replies and original posts with OpenAI.
- Posts through the official X API with `twitter-api-v2`.
- Runs on a local/server cron loop with `node-cron`, PM2, or Docker.
- Supports simulation mode so you can test decisions without posting.

## Quick Start

```bash
npm install
cp .env.example .env
```

Fill in `.env`, then customize the bot voice and topics in `src/config.ts`.

For a safe dry run:

```bash
# Keep SIMULATE_MODE="true" in .env
npm run run-now
```

For scheduled local/server execution:

```bash
npm run dev
```

For production:

```bash
npm run build
npm run start
```

## Required Accounts

| Service | Used for | Required env vars |
| --- | --- | --- |
| TwitterAPI.io | Searching recent public posts | `TWITTERAPI_IO_KEY` |
| X Developer App | Posting, replying, reposting, quote tweeting | `X_APP_KEY`, `X_APP_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` |
| OpenAI | Generating post and reply text | `OPENAI_API_KEY`, optional `OPENAI_MODEL` |

`TWITTERAPI_IO_KEY` is only for search. Posting requires official X API credentials with write access.

## Configure The Bot

Most user-facing behavior lives in `src/config.ts`:

- `systemPrompt`: account voice and boundaries
- `postExamples`: style references
- `personality`: useful context for generation
- `topicWeights`: which topics matter most
- `topicKeywords`: search terms used by TwitterAPI.io
- `originalPostPrompts`: seed prompts for standalone posts
- `cadence`: rough action budgets by time window

If you want an LLM to generate these fields from an interview, use [PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md).

## Scheduling

The built-in scheduler is in `src/scheduler.ts`. It reads `CRON_SCHEDULE` from `.env` and falls back to:

```bash
5 */8 * * *
```

That runs every 8 hours at 5 minutes past the hour, using the server's local timezone. See [SCHEDULING.md](./SCHEDULING.md) for cron examples and deployment options.

## OpenAI Model

The default model is `gpt-5.5`, using Chat Completions because that matches the current implementation. You can set `OPENAI_MODEL` in `.env` to use a cheaper or faster model such as `gpt-5.4-mini`.

Only OpenAI is implemented. To add another provider, add a new client in `src/services/`, keep the same `generateContent(prompt)` contract, and update imports in `src/bot.ts`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run the scheduler with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled scheduler |
| `npm run run-now` | Run one bot cycle immediately, bypassing cadence windows |
| `npm test` | Run Vitest tests |
| `npm run pm2` | Build and start with PM2 |

`npm run run-now` still respects `SIMULATE_MODE`. Keep `SIMULATE_MODE="true"` until credentials and behavior are verified.

## Project Structure

```text
src/
  bot.ts                    Main bot cycle
  config.ts                 Bot voice, topics, cadence, and thresholds
  scheduler.ts              node-cron scheduler
  services/
    openaiClient.ts         OpenAI text generation wrapper
    xClient.ts              TwitterAPI.io search and X API posting wrapper
  strategies/
    chooseAction.ts         Action selection and engagement scoring
  utils/
    logger.ts               Pino logger
tests/
  mocks/
    setup.ts                Vitest mocks
  strategies/
    chooseAction.test.ts    Strategy tests
```

## Deployment

For a simple VPS setup, use PM2 or Docker. See [DEPLOYMENT.md](./DEPLOYMENT.md).

Before running live:

- Set `SIMULATE_MODE="true"` and inspect several dry runs.
- Confirm the X app has write permissions.
- Confirm `CRON_SCHEDULE` matches the server timezone.
- Keep `.env` out of git. `.env.example` is the only env file that should be committed.
