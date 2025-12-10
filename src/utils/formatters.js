import { formatDate, formatTimeRange, getWeekNumber } from './time.js';

/**
 * Format a Google Calendar event for display
 * @param {Object} event - Google Calendar event
 * @returns {string} Formatted event string
 */
function formatEvent(event) {
  const title = event.summary || 'Untitled Event';
  const description = event.description || '';
  
  let timeStr = '';
  if (event.start.dateTime) {
    // Timed event
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    timeStr = formatTimeRange(start, end);
  } else if (event.start.date) {
    // All-day event
    timeStr = 'All day';
  }

  let eventText = `*${title}*`;
  if (timeStr) {
    eventText += ` • ${timeStr}`;
  }
  if (description) {
    eventText += `\n${description}`;
  }

  return eventText;
}

/**
 * Format daily digest as Slack Block Kit blocks
 * @param {Array} events - Regular events for today
 * @param {Array} milestones - Milestone events for today
 * @returns {Array} Slack Block Kit blocks
 */
export function formatDailyDigest(events, milestones) {
  const today = new Date();
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📅 Daily Calendar Digest - ${formatDate(today)}`,
        emoji: true
      }
    },
    {
      type: 'divider'
    }
  ];

  // Milestones section
  if (milestones.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🎯 Today\'s Milestones*'
      }
    });

    milestones.forEach(event => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: formatEvent(event)
        }
      });
    });

    if (events.length > 0) {
      blocks.push({
        type: 'divider'
      });
    }
  }

  // Regular events section
  if (events.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📋 Today\'s Events*'
      }
    });

    events.forEach(event => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: formatEvent(event)
        }
      });
    });
  }

  // Empty state
  if (events.length === 0 && milestones.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No events scheduled for today._'
      }
    });
  }

  // Footer
  blocks.push({
    type: 'divider'
  });
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Generated on ${formatDate(today)}`
      }
    ]
  });

  return blocks;
}

/**
 * Format weekly digest as Slack Block Kit blocks
 * @param {Array} events - Regular events for the week
 * @param {Array} milestones - Milestone events for the week
 * @returns {Array} Slack Block Kit blocks
 */
export function formatWeeklyDigest(events, milestones) {
  const today = new Date();
  const weekNumber = getWeekNumber(today);
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📅 Weekly Calendar Digest - Week ${weekNumber}`,
        emoji: true
      }
    },
    {
      type: 'divider'
    }
  ];

  // Milestones section
  if (milestones.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🎯 This Week\'s Milestones*'
      }
    });

    milestones.forEach(event => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: formatEvent(event)
        }
      });
    });

    if (events.length > 0) {
      blocks.push({
        type: 'divider'
      });
    }
  }

  // Regular events section
  if (events.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📋 This Week\'s Events*'
      }
    });

    // Group events by day
    const eventsByDay = {};
    events.forEach(event => {
      let dateKey;
      if (event.start.dateTime) {
        dateKey = new Date(event.start.dateTime).toISOString().split('T')[0];
      } else if (event.start.date) {
        dateKey = event.start.date;
      } else {
        return;
      }

      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = [];
      }
      eventsByDay[dateKey].push(event);
    });

    // Sort days and format
    Object.keys(eventsByDay).sort().forEach(dateKey => {
      const dayEvents = eventsByDay[dateKey];
      const date = new Date(dateKey + 'T00:00:00Z');
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${formatDate(date)}*`
        }
      });

      dayEvents.forEach(event => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `  ${formatEvent(event)}`
          }
        });
      });
    });
  }

  // Empty state
  if (events.length === 0 && milestones.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No events scheduled for this week._'
      }
    });
  }

  // Footer
  blocks.push({
    type: 'divider'
  });
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Week ${weekNumber} • Generated on ${formatDate(today)}`
      }
    ]
  });

  return blocks;
}

