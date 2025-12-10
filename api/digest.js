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
        // Handle both full URLs and relative paths (for cron jobs)
        let mode;
        const urlString = request.url || '';

        logger.info(`Request URL: ${urlString || '(empty)'}`);

        if (!urlString) {
            throw new Error('Request URL is empty. Cannot determine mode.');
        }

        try {
            // Try parsing as full URL first
            const url = new URL(urlString);
            mode = url.searchParams.get('mode');
            logger.info(`Parsed mode from URL: ${mode}`);
        } catch (e) {
            // If URL parsing fails, extract query string manually
            // This handles cases where request.url might be a relative path
            logger.info(`URL parsing failed, trying manual extraction: ${e.message}`);

            // Try with a base URL if it's a relative path
            try {
                const baseUrl = 'https://vercel.app';
                const url = new URL(urlString, baseUrl);
                mode = url.searchParams.get('mode');
                logger.info(`Parsed mode with base URL: ${mode}`);
            } catch (e2) {
                // If that also fails, extract query string manually
                const queryString = urlString.includes('?')
                    ? urlString.split('?')[1]
                    : urlString;

                if (queryString) {
                    const params = new URLSearchParams(queryString);
                    mode = params.get('mode');
                    logger.info(`Parsed mode from query string: ${mode}`);
                }

                // If still no mode, try to get from path (for cron jobs that pass it in path)
                if (!mode && urlString.includes('mode=')) {
                    const match = urlString.match(/mode=([^&]+)/);
                    mode = match ? match[1] : null;
                    logger.info(`Parsed mode from path regex: ${mode}`);
                }
            }
        }

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

