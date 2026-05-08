# Deployment

This bot is a long-running Node process. The simplest production setups are PM2 on a VPS or Docker Compose.

## Before Deploying

1. Create `.env` from `.env.example`.
2. Set `SIMULATE_MODE="true"` for the first production boot.
3. Confirm your X app has write access.
4. Confirm the server timezone matches your intended `CRON_SCHEDULE`.
5. Run several dry cycles and inspect logs before switching `SIMULATE_MODE` to `false`.

## PM2 On A VPS

```bash
git clone https://github.com/oddscenes/os-x-bot.git
cd os-x-bot
npm install
cp .env.example .env
npm run build
npm run pm2
npx pm2 save
npx pm2 startup
```

Useful commands:

```bash
npx pm2 status
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
```

## Docker Compose

```bash
git clone https://github.com/oddscenes/os-x-bot.git
cd os-x-bot
cp .env.example .env
docker compose up --build -d
docker compose logs -f
```

Stop it:

```bash
docker compose down
```

Update it:

```bash
git pull
docker compose up --build -d
```

## Environment Variables

Set these in `.env` or your host's secret manager:

```bash
TWITTERAPI_IO_KEY=""
X_APP_KEY=""
X_APP_SECRET=""
X_ACCESS_TOKEN=""
X_ACCESS_SECRET=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.5"
CRON_SCHEDULE="5 */8 * * *"
SIMULATE_MODE="true"
```

Switch `SIMULATE_MODE` to `false` only when the dry-run logs look correct.

## Logs

PM2 writes logs to:

```text
logs/out.log
logs/error.log
```

Docker logs:

```bash
docker compose logs -f
```

## Notes

- TwitterAPI.io is used for search. Live posting uses the official X API credentials.
- OpenAI is the only implemented AI provider. Add other providers under `src/services/` if you need them.
