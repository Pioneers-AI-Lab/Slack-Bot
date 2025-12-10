import { google } from 'googleapis';
import { logger } from '../utils/logger.js';

let calendarClient = null;

/**
 * Initialize Google Calendar API client
 * @returns {google.calendar_v3.Calendar} Calendar API client
 */
function getCalendarClient() {
  if (calendarClient) {
    return calendarClient;
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    throw new Error('Missing Google Calendar credentials. Check GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CALENDAR_ID environment variables.');
  }

  const auth = new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/calendar.readonly']
  );

  calendarClient = google.calendar({ version: 'v3', auth });
  return calendarClient;
}

/**
 * Check if an event is a milestone
 * @param {Object} event - Google Calendar event
 * @returns {boolean} True if event is a milestone
 */
function isMilestone(event) {
  const title = event.summary || '';
  const description = event.description || '';
  const text = `${title} ${description}`.toLowerCase();
  return text.includes('[milestone]') || text.includes('milestone:');
}

/**
 * Fetch events from Google Calendar for a given date range
 * @param {Date} timeMin - Start of date range
 * @param {Date} timeMax - End of date range
 * @returns {Promise<{events: Array, milestones: Array}>} Events and milestones
 */
export async function fetchCalendarEvents(timeMin, timeMax) {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    logger.info(`Fetching events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const milestones = [];
    const regularEvents = [];

    events.forEach(event => {
      if (isMilestone(event)) {
        milestones.push(event);
      } else {
        regularEvents.push(event);
      }
    });

    logger.info(`Found ${events.length} total events (${milestones.length} milestones, ${regularEvents.length} regular)`);

    return {
      events: regularEvents,
      milestones: milestones
    };
  } catch (error) {
    logger.error('Error fetching calendar events:', error.message);
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }
}

