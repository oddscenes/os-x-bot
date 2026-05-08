import dotenv from 'dotenv';
// Load .env file at the very top, before any other imports
dotenv.config(); 

import logger from './utils/logger';
import { chooseNextAction } from './strategies/chooseAction';
import { generateContent } from './services/openaiClient';
import { postTweet, replyToTweet, retweet, quoteTweet } from './services/xClient'; 
import { config } from './config';

/**
 * Main function to run the bot's logic cycle.
 * @param bypassCadence - If true, ignores cadence windows for immediate posting
 */
export async function runBotCycle(bypassCadence: boolean = false) {
  logger.info('Starting bot cycle...');

  try {
    const decision = await chooseNextAction(bypassCadence);
    logger.info(`Action decided: ${decision.type} - ${decision.reason}`);

    switch (decision.type) {
      case 'reply':
        if (!decision.targetTweet) {
          logger.error('Decision was \'reply\' but targetTweet was missing.');
          break;
        }
        // 1. Generate reply content using OpenAI
        const replyTarget = decision.targetTweet.authorUsername || decision.targetTweet.authorId;
        const replyPrompt = `Reply to @${replyTarget}:\n\n"${decision.targetTweet.text}"\n\nAdd value. Be brief and helpful.`;
        const replyContent = await generateContent(replyPrompt);

        if (!replyContent) {
          logger.error('Reply content generation failed or was flagged by safeguards.');
          break; // Skip to next cycle
        }

        // 2. Post the reply via xClient
        const replyResultId = await replyToTweet(replyContent, decision.targetTweet.id);

        if (!replyResultId) {
             logger.warn('Reply was not successful.');
        }
        break;

      case 'repost':
        if (!decision.targetTweet) {
          logger.error('Decision was \'repost\' but targetTweet was missing.');
          break;
        }
        // 1. Retweet using xClient
        const retweetSuccess = await retweet(decision.targetTweet.id);

        if (!retweetSuccess) {
            logger.warn('Retweet was not successful.');
        }
        break;

      case 'quote_tweet':
        if (!decision.targetTweet) {
          logger.error('Decision was \'quote_tweet\' but targetTweet was missing.');
          break;
        }
        
        // 1. Generate quote tweet commentary using OpenAI
        const quoteTarget = decision.targetTweet.authorUsername || decision.targetTweet.authorId;
        const quoteTweetPrompt = `Quick comment on this tweet by @${quoteTarget}:\n\n"${decision.targetTweet.text}"\n\nAdd your take. Be brief and insightful.`;
        const quoteContent = await generateContent(quoteTweetPrompt);

        if (!quoteContent) {
          logger.error('Quote tweet content generation failed or was flagged by safeguards.');
          break; // Skip to next cycle
        }

        // 2. Post the quote tweet via xClient
        const quoteResultId = await quoteTweet(quoteContent, decision.targetTweet.id);

        if (!quoteResultId) {
            logger.warn('Quote tweet was not successful.');
        }
        break;

      case 'original_post':
        // 1. Generate original post content using the template prompts in config.
        const randomPrompt = config.originalPostPrompts.length > 0
          ? config.originalPostPrompts[Math.floor(Math.random() * config.originalPostPrompts.length)]
          : 'Write a concise, useful post for this account.';
        logger.debug({ selectedPrompt: randomPrompt }, 'Selected prompt for original post');
        const postContent = await generateContent(randomPrompt);

        if (!postContent) {
          logger.error('Original post content generation failed or was flagged by safeguards.');
          break; // Skip to next cycle
        }

        // 2. Post the tweet via xClient
        const postResultId = await postTweet(postContent);

        if (!postResultId) {
             logger.warn('Original post was not successful.');
        }
        break;

      case 'ignore':
        logger.info('No action taken based on current strategy.');
        break;

      default:
        logger.warn(`Unhandled decision type: ${(decision as any).type}`);
    }

  } catch (error) {
    logger.error({ error }, 'Error during bot cycle');
  }

  logger.info('Bot cycle finished.');
}

// --- Entry Point --- 
// Run the bot when this file is executed directly
if (require.main === module) {
  logger.info('Running bot cycle directly...');
  
  runBotCycle(true) // Bypass cadence windows for immediate posting
    .then(async () => {
      logger.info('Bot execution completed successfully.');
      process.exit(0);
    })
    .catch(async (error) => {
      logger.fatal({ error }, 'Unhandled error during bot execution.');
      process.exit(1);
    });
}
