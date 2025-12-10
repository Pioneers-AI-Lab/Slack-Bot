import dotenv from 'dotenv';
dotenv.config();

import { fetchCalendarEvents } from '../src/calendar/google.js';
import { getDailyDateRange, getWeeklyDateRange } from '../src/utils/time.js';

async function testCalendar() {
  console.log('=== Testing Google Calendar Integration ===\n');

  // Check environment variables
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CALENDAR_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('   Please set them in .env file');
    console.error('   Required:', required.join(', '));
    return;
  }

  console.log('✅ All required environment variables are set');
  console.log('   Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
  console.log('   Service Account:', process.env.GOOGLE_CLIENT_EMAIL);
  console.log();

  try {
    // Test daily range
    console.log('1. Testing Daily Date Range:');
    const daily = getDailyDateRange();
    console.log('   Fetching events from:', daily.start.toISOString());
    console.log('   To:', daily.end.toISOString());
    
    const dailyResult = await fetchCalendarEvents(daily.start, daily.end);
    console.log('   ✅ Success!');
    console.log('   Regular events:', dailyResult.events.length);
    console.log('   Milestones:', dailyResult.milestones.length);
    console.log();

    // Test weekly range
    console.log('2. Testing Weekly Date Range:');
    const weekly = getWeeklyDateRange();
    console.log('   Fetching events from:', weekly.start.toISOString());
    console.log('   To:', weekly.end.toISOString());
    
    const weeklyResult = await fetchCalendarEvents(weekly.start, weekly.end);
    console.log('   ✅ Success!');
    console.log('   Regular events:', weeklyResult.events.length);
    console.log('   Milestones:', weeklyResult.milestones.length);
    console.log();

    // Display sample events
    if (dailyResult.events.length > 0 || dailyResult.milestones.length > 0) {
      console.log('3. Sample Events (Daily):');
      const allEvents = [...dailyResult.milestones, ...dailyResult.events].slice(0, 5);
      allEvents.forEach((event, i) => {
        console.log(`   ${i + 1}. ${event.summary || 'Untitled'}`);
        console.log(`      Start: ${event.start.dateTime || event.start.date}`);
        if (event.description) {
          console.log(`      Description: ${event.description.substring(0, 50)}...`);
        }
      });
      console.log();
    }

    // Test milestone detection
    if (dailyResult.milestones.length > 0) {
      console.log('4. Milestone Detection:');
      console.log('   ✅ Milestones correctly identified');
      dailyResult.milestones.forEach((milestone, i) => {
        console.log(`   ${i + 1}. ${milestone.summary}`);
      });
    } else {
      console.log('4. Milestone Detection:');
      console.log('   ℹ️  No milestones found in daily range (this is OK)');
    }

    console.log();
    console.log('✅ Calendar integration test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('credentials')) {
      console.error('   Check that:');
      console.error('   1. Service account email is correct');
      console.error('   2. Private key is properly formatted (with \\n for newlines)');
      console.error('   3. Calendar is shared with the service account');
    } else if (error.message.includes('calendar')) {
      console.error('   Check that:');
      console.error('   1. Calendar ID is correct');
      console.error('   2. Calendar API is enabled in Google Cloud Console');
      console.error('   3. Service account has read access to the calendar');
    }
    console.error('   Full error:', error.stack);
  }
}

testCalendar();

