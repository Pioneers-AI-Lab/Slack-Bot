import dotenv from 'dotenv';
dotenv.config();

import { postSlackMessage, notifyAdmin } from '../src/services/slack.js';

async function testSlack() {
  console.log('=== Testing Slack Integration ===\n');

  // Check environment variables
  if (!process.env.SLACK_BOT_TOKEN) {
    console.error('❌ Missing SLACK_BOT_TOKEN');
    console.error('   Please set it in .env file');
    return;
  }

  if (!process.env.SLACK_CHANNEL_ID) {
    console.error('❌ Missing SLACK_CHANNEL_ID');
    console.error('   Please set it in .env file');
    return;
  }

  console.log('✅ Required environment variables are set');
  console.log('   Channel ID:', process.env.SLACK_CHANNEL_ID);
  console.log('   Admin Channel:', process.env.SLACK_ADMIN_CHANNEL_ID || 'Not set (optional)');
  console.log();

  try {
    // Test 1: Simple message
    console.log('1. Testing Simple Message Post:');
    const testBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🧪 Test Message*\n\nThis is a test from the Calendar Autobot integration test.\n\nIf you see this, Slack integration is working! ✅'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Test sent at ${new Date().toLocaleString()}`
          }
        ]
      }
    ];

    const result = await postSlackMessage(testBlocks);
    console.log('   ✅ Message posted successfully!');
    console.log('   Channel:', result.channel);
    console.log('   Timestamp:', result.ts);
    console.log('   Message URL:', result.message?.permalink || 'N/A');
    console.log();

    // Test 2: Admin notification (if configured)
    if (process.env.SLACK_ADMIN_CHANNEL_ID) {
      console.log('2. Testing Admin Notification:');
      await notifyAdmin('This is a test admin notification from the integration test suite.');
      console.log('   ✅ Admin notification sent!');
      console.log('   Admin Channel:', process.env.SLACK_ADMIN_CHANNEL_ID);
    } else {
      console.log('2. Admin Notification:');
      console.log('   ⚠️  SLACK_ADMIN_CHANNEL_ID not set, skipping');
      console.log('   (This is optional and won\'t affect main functionality)');
    }

    console.log();
    console.log('✅ Slack integration test complete!');
    console.log('   Check your Slack channel to verify the message was posted.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('token')) {
      console.error('   Check that:');
      console.error('   1. SLACK_BOT_TOKEN is valid and not expired');
      console.error('   2. Bot is installed in your workspace');
      console.error('   3. Bot has chat:write scope');
    } else if (error.message.includes('channel')) {
      console.error('   Check that:');
      console.error('   1. SLACK_CHANNEL_ID is correct');
      console.error('   2. Bot is a member of the channel');
      console.error('   3. Channel ID starts with C (for public channels)');
    }
    console.error('   Full error:', error.stack);
  }
}

testSlack();

