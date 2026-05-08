# Scheduling

The built-in scheduler lives in `src/scheduler.ts`.

It uses `node-cron` and reads this environment variable:

```bash
CRON_SCHEDULE="5 */8 * * *"
```

If `CRON_SCHEDULE` is not set, the code falls back to `5 */8 * * *`, which runs every 8 hours at 5 minutes past the hour.

## Where To Change It

- Change the schedule without editing code: update `CRON_SCHEDULE` in `.env`.
- Change scheduler behavior in code: edit `src/scheduler.ts`.
- Change what actions are allowed during each time window: edit `cadence` in `src/config.ts`.

## Cron Examples

| Schedule | Meaning |
| --- | --- |
| `5 */8 * * *` | Every 8 hours at minute 5 |
| `0 9,15,21 * * *` | 09:00, 15:00, and 21:00 every day |
| `*/30 * * * *` | Every 30 minutes |
| `0 */4 * * *` | Every 4 hours |
| `0 10 * * 1-5` | 10:00 Monday through Friday |

`node-cron` uses the server process timezone. On most VPS setups that means the server timezone, often UTC unless you changed it.

## Recommended Setups

### Local Development

```bash
npm run dev
```

This starts `src/scheduler.ts` with auto-reload.

### PM2 Server Process

```bash
npm run build
npm run pm2
pm2 save
```

PM2 keeps the scheduler process alive. The scheduler handles the cron timing internally.

### Docker Compose

```bash
docker compose up --build -d
docker compose logs -f
```

The container runs PM2, which runs the compiled scheduler.

### External Cron

If you prefer system cron, compile first and run the bot directly:

```bash
npm run build
node dist/bot.js
```

Important: `dist/bot.js` runs one cycle immediately and bypasses the internal cadence windows. In that setup, your external cron schedule is the cadence.

## Safe Testing

Keep this in `.env` until you have reviewed several runs:

```bash
SIMULATE_MODE="true"
```

Simulation mode logs intended actions and skips live X posting.
