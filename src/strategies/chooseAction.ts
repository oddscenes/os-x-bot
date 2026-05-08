import logger from '../utils/logger';
import { config } from '../config';
import { searchRecentTweets } from '../services/xClient';

const ENGAGEMENT_THRESHOLD = config.engagement.replyThreshold;
type CadenceWindow = (typeof config.cadence)[keyof typeof config.cadence];

interface TweetCandidate {
  id: string;
  text: string;
  authorId: string;
  authorUsername?: string;
  authorFollowers: number;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  createdAt: Date;
}

interface ActionDecision {
  type: 'reply' | 'repost' | 'quote_tweet' | 'original_post' | 'ignore';
  reason: string;
  targetTweet?: TweetCandidate;
}

function isTweetRelevant(text: string): boolean {
  const lowerText = text.toLowerCase();

  return Object.values(config.topicKeywords).some(keywords => {
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  });
}

function getCurrentCadenceWindow(currentHour: number): CadenceWindow | null {
  for (const windowKey in config.cadence) {
    const windowConfig = config.cadence[windowKey as keyof typeof config.cadence];
    if (currentHour >= windowConfig.startHour && currentHour < windowConfig.endHour) {
      return windowConfig;
    }
  }

  return null;
}

function getActionWeight(
  windowConfig: CadenceWindow | null,
  action: 'original' | 'reposts' | 'replies',
  bypassCadence: boolean
): number {
  if (bypassCadence) return 1;
  if (!windowConfig || !(action in windowConfig)) return 0;

  const value = windowConfig[action as keyof CadenceWindow];
  return typeof value === 'number' && value > 0 ? Math.floor(value) : 0;
}

function addWeightedAction(
  actions: Omit<ActionDecision, 'reason'>[],
  action: Omit<ActionDecision, 'reason'>,
  weight: number
): void {
  for (let i = 0; i < weight; i += 1) {
    actions.push(action);
  }
}

function clampProbability(value: number): number {
  return Math.max(0, Math.min(1, value));
}

async function fetchTweetCandidates(): Promise<TweetCandidate[]> {
  return searchRecentTweets(20);
}

/**
 * Calculates an engagement score for a tweet candidate.
 * Formula: (author_followers ^ 0.5) * (like_count + retweet_count * 1.5) / tweet_age_minutes
 */
export function calculateEngagementScore(tweet: TweetCandidate): number {
  const ageMinutes = (Date.now() - tweet.createdAt.getTime()) / (1000 * 60);
  if (ageMinutes <= 0) return 0;

  return (Math.sqrt(tweet.authorFollowers) * (tweet.likeCount + tweet.retweetCount * 1.5)) / ageMinutes;
}

/**
 * Chooses one action for the current cycle.
 *
 * The scheduler controls how often cycles run, and `config.cadence` controls which
 * action types are eligible during each local-time window.
 */
export async function chooseNextAction(bypassCadence: boolean = false): Promise<ActionDecision> {
  logger.info('Choosing next action...');

  const now = new Date();
  const currentWindow = getCurrentCadenceWindow(now.getHours());

  if (!bypassCadence && !currentWindow) {
    return { type: 'ignore', reason: 'Outside of defined cadence windows.' };
  }

  if (bypassCadence) {
    logger.info('Bypassing cadence windows - all actions allowed.');
  }

  logger.info('Fetching tweet candidates for possible engagement actions...');
  const allCandidates = await fetchTweetCandidates();
  const relevantCandidates = allCandidates
    .filter(tweet => isTweetRelevant(tweet.text))
    .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a));

  logger.info(`Found ${allCandidates.length} total candidates, ${relevantCandidates.length} are relevant.`);

  const possibleActions: Omit<ActionDecision, 'reason'>[] = [];

  const originalWeight = getActionWeight(currentWindow, 'original', bypassCadence);
  addWeightedAction(possibleActions, { type: 'original_post' }, originalWeight);

  if (
    originalWeight > 0 &&
    relevantCandidates.length > 0 &&
    Math.random() < clampProbability(config.quoteTweetProbability)
  ) {
    addWeightedAction(possibleActions, { type: 'quote_tweet', targetTweet: relevantCandidates[0] }, 1);
  }

  const repostWeight = getActionWeight(currentWindow, 'reposts', bypassCadence);
  for (const candidate of relevantCandidates.slice(0, repostWeight)) {
    possibleActions.push({ type: 'repost', targetTweet: candidate });
  }

  const replyWeight = getActionWeight(currentWindow, 'replies', bypassCadence);
  const replyCandidates = relevantCandidates
    .filter(tweet => calculateEngagementScore(tweet) > ENGAGEMENT_THRESHOLD)
    .slice(0, replyWeight);

  for (const candidate of replyCandidates) {
    possibleActions.push({ type: 'reply', targetTweet: candidate });
  }

  if (possibleActions.length === 0) {
    logger.info('No suitable actions found based on current candidates and cadence.');
    return { type: 'ignore', reason: 'No valid actions available.' };
  }

  const randomIndex = Math.floor(Math.random() * possibleActions.length);
  const chosenAction = possibleActions[randomIndex];
  const reason = `Randomly selected '${chosenAction.type}' from a pool of ${possibleActions.length} possible actions.`;

  logger.info(
    { chosenAction: chosenAction.type, reason, pool: possibleActions.map(action => action.type) },
    'Action decided.'
  );

  return { ...chosenAction, reason };
}
