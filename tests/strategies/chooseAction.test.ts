import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateEngagementScore, chooseNextAction } from '../../src/strategies/chooseAction';
import * as xClient from '../../src/services/xClient';

vi.mock('../../src/services/xClient');

const mockedSearch = vi.mocked(xClient.searchRecentTweets);

describe('calculateEngagementScore', () => {
  const createTweet = (overrides: Partial<any> = {}): any => ({
    id: '123',
    text: 'Test tweet',
    authorId: 'author1',
    authorFollowers: 1000,
    likeCount: 50,
    retweetCount: 10,
    replyCount: 5,
    quoteCount: 2,
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    ...overrides,
  });

  it('calculates score for a typical tweet', () => {
    const tweet = createTweet();
    expect(calculateEngagementScore(tweet)).toBeCloseTo(34.258, 3);
  });

  it('returns 0 for zero or future age', () => {
    const now = Date.now();
    const dateNow = vi.spyOn(Date, 'now').mockReturnValue(now);

    expect(calculateEngagementScore(createTweet({ createdAt: new Date(now) }))).toBe(0);
    expect(calculateEngagementScore(createTweet({ createdAt: new Date(now + 60000) }))).toBe(0);

    dateNow.mockRestore();
  });

  it('increases with engagement and decreases with age', () => {
    const low = createTweet({ likeCount: 10, retweetCount: 2 });
    const high = createTweet({ likeCount: 100, retweetCount: 50 });
    const old = createTweet({
      likeCount: 100,
      retweetCount: 50,
      createdAt: new Date(Date.now() - 120 * 60 * 1000),
    });

    expect(calculateEngagementScore(high)).toBeGreaterThan(calculateEngagementScore(low));
    expect(calculateEngagementScore(high)).toBeGreaterThan(calculateEngagementScore(old));
  });
});

describe('chooseNextAction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockedSearch.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ignores when outside configured cadence windows', async () => {
    vi.setSystemTime(new Date(2024, 0, 1, 12, 30));

    const decision = await chooseNextAction();

    expect(mockedSearch).not.toHaveBeenCalled();
    expect(decision).toEqual({
      type: 'ignore',
      reason: 'Outside of defined cadence windows.',
    });
  });

  it('can choose an original post inside an original-post cadence window', async () => {
    vi.setSystemTime(new Date(2024, 0, 1, 9, 0));

    const decision = await chooseNextAction();

    expect(mockedSearch).toHaveBeenCalledWith(20);
    expect(decision.type).toBe('original_post');
  });
});
