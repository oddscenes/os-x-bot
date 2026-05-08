import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

function parseIntEnv(envVar: string | undefined, defaultValue: number): number {
  if (envVar === undefined) return defaultValue;
  const parsed = parseInt(envVar, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

const botHandle = env.BOT_HANDLE || '@your_x_bot';
const botName = env.BOT_NAME || 'X Bot';

const systemPrompt = `You are ${botHandle}, an automated X account run by ${botName}.

Your job is to post and engage around the configured topics with useful, specific, human-sounding takes.

Tone:
- Clear, direct, and conversational
- No hashtags unless the user explicitly configures that style
- No emoji by default
- No corporate filler
- Short enough to feel native to X

Content rules:
- Add a concrete observation, practical tip, or useful framing
- Do not pretend to have personal experiences you were not given
- Do not mention that you are an AI unless asked
- Output only the post text
- Stay under 240 characters unless the prompt asks for a reply that needs more context`;

export const config = {
  botHandle,
  botName,

  // Edit this prompt to define the account voice and boundaries.
  systemPrompt,

  // Examples are used as style references for original posts.
  postExamples: [
    'Small workflow improvements compound when they remove a decision you repeat every day.',
    'Good product design usually feels boring in the best way: obvious, fast, and hard to misuse.',
    'Automation works best when it protects attention instead of creating more things to monitor.',
    'A useful AI tool should shrink the distance between intent and shipped work.',
    'Strong systems make the right action easier than the wrong one.',
  ],

  personality: {
    name: botName,
    bio: 'A focused X bot that shares useful ideas, replies with context, and curates relevant posts around a defined niche.',
    background: 'Customize this section with the operator, brand, or project context the bot should reflect.',
    experience: 'Describe the perspective the bot should write from. Keep it truthful and specific.',
    knowledge: [
      'Product thinking',
      'Design systems',
      'Frontend engineering',
      'Automation workflows',
      'AI-assisted software',
    ],
  },

  // Higher weight means the bot prioritizes that topic when ranking search terms.
  topicWeights: {
    ai: 9,
    design: 8,
    webdev: 8,
    startups: 6,
    productivity: 6,
    systems: 5,
  },

  // Keep the combined query short. X search APIs commonly reject very long OR queries.
  topicKeywords: {
    ai: ['AI tools', 'AI agents', 'artificial intelligence', 'LLM'],
    design: ['product design', 'UI design', 'UX design', 'design systems'],
    webdev: ['TypeScript', 'React', 'Next.js', 'frontend'],
    startups: ['bootstrapping', 'indie hacking', 'startup'],
    productivity: ['automation', 'workflow', 'productivity'],
    systems: ['systems thinking', 'process design', 'operations'],
  },

  // These prompts seed original posts. Keep them aligned with your account niche.
  originalPostPrompts: [
    'Share a practical insight about product design.',
    'Share a concise observation about AI-assisted work.',
    'Share a useful workflow or automation idea.',
    'Share a frontend engineering lesson that applies broadly.',
    'Share a systems-thinking principle for better work.',
    'Share a grounded take on building small products.',
  ],

  engagement: {
    replyThreshold: parseIntEnv(env.ENGAGEMENT_REPLY_THRESHOLD, 10),
  },

  // Approximate action budgets by local server time.
  cadence: {
    morning: {
      startHour: 6,
      endHour: 12,
      reposts: parseIntEnv(env.CADENCE_MORNING_REPOSTS, 2),
      original: parseIntEnv(env.CADENCE_MORNING_ORIGINAL, 2),
    },
    afternoon: {
      startHour: 13,
      endHour: 17,
      replies: parseIntEnv(env.CADENCE_AFTERNOON_REPLIES, 2),
      original: parseIntEnv(env.CADENCE_AFTERNOON_ORIGINAL, 1),
    },
    evening: {
      startHour: 19,
      endHour: 24,
      replies: parseIntEnv(env.CADENCE_EVENING_REPLIES, 1),
      reposts: parseIntEnv(env.CADENCE_EVENING_REPOSTS, 2),
      original: parseIntEnv(env.CADENCE_EVENING_ORIGINAL, 1),
    },
    lateNight: {
      startHour: 0,
      endHour: 6,
      replies: parseIntEnv(env.CADENCE_LATE_NIGHT_REPLIES, 0),
      reposts: parseIntEnv(env.CADENCE_LATE_NIGHT_REPOSTS, 0),
      original: parseIntEnv(env.CADENCE_LATE_NIGHT_ORIGINAL, 0),
    },
  },

  quoteTweetProbability: 0.5,
  simulateMode: env.SIMULATE_MODE === 'true',
  logLevel: env.LOG_LEVEL || 'info',
};
