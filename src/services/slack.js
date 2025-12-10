import { WebClient } from '@slack/web-api';
import { logger } from '../utils/logger.js';

let slackClient = null;

/**
 * Initialize Slack Web API client
 * @returns {WebClient} Slack client
 */
function getSlackClient() {
  if (slackClient) {
    return slackClient;
  }

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error('Missing SLACK_BOT_TOKEN environment variable.');
  }

  slackClient = new WebClient(token);
  return slackClient;
}

/**
 * Post a message to Slack channel
 * @param {Array} blocks - Slack Block Kit blocks
 * @param {string} channelId - Slack channel ID
 * @returns {Promise<Object>} Slack API response
 */
export async function postSlackMessage(blocks, channelId) {
  try {
    const client = getSlackClient();
    const channel = channelId || process.env.SLACK_CHANNEL_ID;

    if (!channel) {
      throw new Error('Missing SLACK_CHANNEL_ID environment variable.');
    }

    logger.info(`Posting message to channel ${channel}`);

    const result = await client.chat.postMessage({
      channel: channel,
      blocks: blocks,
      text: 'Calendar Digest' // Fallback text for notifications
    });

    logger.info('Message posted successfully');
    return result;
  } catch (error) {
    logger.error('Error posting to Slack:', error.message);
    throw new Error(`Failed to post to Slack: ${error.message}`);
  }
}

/**
 * Send error notification to admin channel (if configured)
 * @param {string} errorMessage - Error message to send
 * @returns {Promise<void>}
 */
export async function notifyAdmin(errorMessage) {
  const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
  if (!adminChannelId) {
    logger.warn('SLACK_ADMIN_CHANNEL_ID not set, skipping admin notification');
    return;
  }

  try {
    const client = getSlackClient();
    await client.chat.postMessage({
      channel: adminChannelId,
      text: `🚨 Calendar Autobot Error: ${errorMessage}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🚨 Calendar Autobot Error*\n\n${errorMessage}`
          }
        }
      ]
    });
    logger.info('Admin notification sent');
  } catch (error) {
    logger.error('Failed to send admin notification:', error.message);
    // Don't throw - admin notification failure shouldn't break the main flow
  }
}

