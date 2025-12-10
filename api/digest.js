import { fetchCalendarEvents } from '../src/calendar/google.js';
import { postSlackMessage, notifyAdmin } from '../src/services/slack.js';
import { formatDailyDigest, formatWeeklyDigest } from '../src/utils/formatters.js';
import { getDailyDateRange, getWeeklyDateRange } from '../src/utils/time.js';
import { logger } from '../src/utils/logger.js';

/**
 * Main API endpoint handler for digest generation
 * @param {Request} request - HTTP request object
 * @returns {Promise<Response>} HTTP response
 */
export default async function handler(request) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');

    if (!mode || (mode !== 'daily' && mode !== 'weekly')) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Invalid mode. Use ?mode=daily or ?mode=weekly' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info(`Processing ${mode} digest`);

    // Get date range based on mode
    const { start, end } = mode === 'daily' 
      ? getDailyDateRange() 
      : getWeeklyDateRange();

    // Fetch events from Google Calendar
    const { events, milestones } = await fetchCalendarEvents(start, end);

    // Format digest based on mode
    const blocks = mode === 'daily'
      ? formatDailyDigest(events, milestones)
      : formatWeeklyDigest(events, milestones);

    // Post to Slack
    await postSlackMessage(blocks);

    const totalEvents = events.length + milestones.length;
    logger.info(`Successfully sent ${mode} digest with ${totalEvents} events`);

    return new Response(
      JSON.stringify({
        status: 'sent',
        digest_type: mode,
        events_count: events.length,
        milestones_count: milestones.length
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    logger.error('Digest generation failed:', error.message);
    
    // Notify admin if configured
    await notifyAdmin(`Failed to generate digest: ${error.message}`);

    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

