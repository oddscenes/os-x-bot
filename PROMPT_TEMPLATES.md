# Prompt Templates

Use these prompts with your preferred LLM to generate a customized `src/config.ts` profile for a new bot.

## Interview Prompt

Paste this when you want the LLM to ask questions first:

```text
I am setting up an X bot from the Odd Scenes X Bot template.

Your job is to interview me, then generate configuration values for src/config.ts.

Ask up to 10 questions. Focus only on information needed to configure:
- BOT_NAME and BOT_HANDLE
- systemPrompt
- postExamples
- personality.name
- personality.bio
- personality.background
- personality.experience
- personality.knowledge
- topicWeights
- topicKeywords
- originalPostPrompts
- cadence recommendations

After I answer, output:
1. A short strategy summary.
2. A TypeScript object or patch-ready snippets for src/config.ts.
3. Suggested .env values for BOT_NAME, BOT_HANDLE, CRON_SCHEDULE, and SIMULATE_MODE.
4. Anything you intentionally left as a manual decision.

Constraints:
- Do not invent private personal history.
- Do not make the bot claim lived experience unless I explicitly provide it.
- Keep topicKeywords short enough for an OR-based X search query.
- Make the voice specific, but not gimmicky.
- Default to SIMULATE_MODE=true.
```

## One-Shot Prompt

Paste this when you already know the account direction:

```text
Create a src/config.ts profile for the Odd Scenes X Bot template.

Account direction:
- Name:
- Handle:
- Audience:
- Main topics:
- Topics to avoid:
- Desired tone:
- Strong opinions or principles:
- Products, services, or projects it can mention:
- Things it must never claim:
- Preferred posting frequency:

Output patch-ready TypeScript values for:
- systemPrompt
- postExamples
- personality
- topicWeights
- topicKeywords
- originalPostPrompts
- cadence

Rules:
- Keep generated posts useful and concise.
- No hashtags unless I specifically ask for them.
- No emojis unless I specifically ask for them.
- Do not invent credentials, account IDs, or personal backstory.
- Keep topicKeywords practical for search, not poetic.
```

## Review Prompt

Paste this after you edit `src/config.ts`:

```text
Review this Odd Scenes X Bot src/config.ts file.

Check for:
- Any private or personal details that should not be in a public template.
- Claims the bot makes that are not supported by the provided context.
- Search keywords that are too broad, too narrow, or likely to create noisy results.
- Original post prompts that could cause generic or repetitive output.
- Cadence settings that seem too aggressive for a small account.

Return:
1. High-risk issues first.
2. Suggested replacement text.
3. A concise final recommendation.

Here is the file:
[paste src/config.ts]
```
