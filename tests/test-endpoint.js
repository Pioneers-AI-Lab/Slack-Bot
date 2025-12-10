import dotenv from 'dotenv';
dotenv.config();

import { fetchCalendarEvents } from '../src/calendar/google.js';
import { formatDailyDigest, formatWeeklyDigest } from '../src/utils/formatters.js';
import { getDailyDateRange, getWeeklyDateRange } from '../src/utils/time.js';
import { postSlackMessage } from '../src/services/slack.js';

async function testFullFlow(mode = 'daily') {
    console.log(`=== Testing Full Flow (${mode} mode) ===\n`);

    try {
        // Step 1: Get date range
        console.log('1. Getting date range...');
        const { start, end } = mode === 'daily'
            ? getDailyDateRange()
            : getWeeklyDateRange();
        console.log('   ✅ Date range:', start.toISOString(), 'to', end.toISOString());
        console.log();

        // Step 2: Fetch calendar events
        console.log('2. Fetching calendar events...');
        const { events, milestones } = await fetchCalendarEvents(start, end);
        console.log('   ✅ Found', events.length, 'events and', milestones.length, 'milestones');
        console.log();

        // Step 3: Format digest
        console.log('3. Formatting digest...');
        const blocks = mode === 'daily'
            ? formatDailyDigest(events, milestones)
            : formatWeeklyDigest(events, milestones);
        console.log('   ✅ Generated', blocks.length, 'blocks');
        console.log();

        // Step 4: Preview structure
        console.log('4. Digest Structure:');
        console.log('   Header:', blocks[0]?.text?.text || 'N/A');
        console.log('   Total blocks:', blocks.length);
        console.log('   Block types:', [...new Set(blocks.map(b => b.type))].join(', '));
        console.log();

        // Step 5: Preview first few blocks
        console.log('5. Preview (first 3 blocks):');
        console.log(JSON.stringify(blocks.slice(0, 3), null, 2));
        console.log();

        // Step 6: Summary
        console.log('6. Summary:');
        console.log(`   Mode: ${mode}`);
        console.log(`   Events: ${events.length}`);
        console.log(`   Milestones: ${milestones.length}`);
        console.log(`   Blocks generated: ${blocks.length}`);
        console.log();

        console.log('✅ Full flow test complete!');
        console.log();
        console.log('⚠️  Note: This test does NOT post to Slack.');
        console.log('   To actually post, uncomment the line in the code:');
        console.log('   // await postSlackMessage(blocks);');
        console.log();
        console.log('   Or run the full endpoint test with:');
        console.log('   curl http://localhost:3000/api/digest?mode=' + mode);
        // await postSlackMessage(blocks);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
}

// Get mode from command line or default to daily
const mode = process.argv[2] || 'daily';

if (mode !== 'daily' && mode !== 'weekly') {
    console.error('❌ Invalid mode. Use "daily" or "weekly"');
    console.error('   Usage: node tests/test-endpoint.js [daily|weekly]');
    process.exit(1);
}

testFullFlow(mode);

