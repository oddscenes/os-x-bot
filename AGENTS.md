# Agent Guide

This repository is a public Odd Scenes template for building a configurable X bot. Keep changes boring, explicit, and easy for a new user to understand.

## Project Intent

- This is not a personal bot repo. Avoid adding account-specific voice, handles, credentials, or private workflow assumptions.
- The default code should remain a working starter template. Use `src/config.ts` for editable persona, topics, cadence, and original-post prompts.
- Keep setup paths concise. Favor README links to focused markdown files over turning the README into a wall of instructions.

## Safety Rules

- Never commit real API keys, `.env` values, account IDs, access tokens, generated logs, or local build output.
- Do not add scripts that post to X without going through the normal `SIMULATE_MODE` and `src/bot.ts` flow.
- Keep `SIMULATE_MODE=true` in examples unless the instruction is explicitly about production deployment.
- Avoid fake production claims. If something is a starter implementation, say so directly.

## Code Rules

- Keep TypeScript strict-friendly and avoid broad rewrites.
- Do not add new providers unless they are implemented and tested. OpenAI is the supported default.
- Keep provider-specific code isolated under `src/services/`.
- Keep action-selection behavior in `src/strategies/chooseAction.ts`.
- Keep schedule changes in `src/scheduler.ts` or environment variables, not scattered through runtime code.

## Documentation Rules

- Update `README.md` when setup steps, scripts, env vars, or deployment paths change.
- Update `SCHEDULING.md` when cron behavior changes.
- Update `PROMPT_TEMPLATES.md` when config shape or persona fields change.
- Prefer short examples that users can copy safely.
