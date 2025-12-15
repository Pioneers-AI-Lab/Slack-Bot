import { formatDate, formatTimeRange, getWeekNumber } from './time.js';

/**
 * Get a random emoji from a curated list for event titles
 * @returns {string} Random emoji
 */
function getRandomEmoji() {
    const emojis = [
        '📅', '📆', '🗓️', '📝', '📋', '📌', '🎯', '⭐', '✨',
        '🔥', '💡', '🚀', '🎉', '🎊', '🌟', '💫', '⚡', '🌈',
        '📚', '📖', '💼', '💻', '📱', '📧', '🏢', '🌍', '🗺️',
        '⏰', '🕐', '☕', '🍕', '🍔', '🌮', '🥗', '🍱', '🎨',
        '🎭', '🎬', '🎮', '🏆', '🥇', '🎁', '🎈', '🎪', '🎲'
    ];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Format a Google Calendar event for display
 * @param {Object} event - Google Calendar event
 * @returns {string} Formatted event string
 */
function formatEvent(event) {
    const title = event.summary || 'Untitled Event';
    const description = event.description || '';
    const location = event.location || '';

    // Split description at first empty line (double line break):
    // - Short description (before first \n\n) is shown in the digest
    //   Can span multiple lines (e.g., bullet points, multi-line summaries)
    // - Long description (after first \n\n) is ignored for now (reserved for future use)
    const shortDescription = description.includes('\n\n')
        ? description.split('\n\n')[0].trim()
        : description.trim();

    let timeStr = '';
    if (event.start?.dateTime) {
        // Timed event
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        timeStr = formatTimeRange(start, end);
    } else if (event.start?.date) {
        // All-day event
        timeStr = 'All day';
    }

    // Line 1: Title with random emoji
    const emoji = getRandomEmoji();
    let eventText = `${emoji} *${title}*`;

    // Line 2: Location and time (below the title) with pin emoji
    const metaParts = [];
    if (location) metaParts.push(location);
    if (timeStr) metaParts.push(timeStr);
    if (metaParts.length > 0) {
        eventText += `\n📍 ${metaParts.join(' • ')}`;
    }

    // Line 3: Short description (optional) with 4-space indentation
    if (shortDescription) {
        // Indent each line of the short description with 4 spaces
        const indentedDescription = shortDescription
            .split('\n')
            .map(line => `    ${line}`)
            .join('\n');
        eventText += `\n${indentedDescription}`;
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
            if (event.start?.dateTime) {
                dateKey = new Date(event.start.dateTime).toISOString().split('T')[0];
            } else if (event.start?.date) {
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
        Object.keys(eventsByDay)
            .sort()
            .forEach(dateKey => {
                const dayEvents = eventsByDay[dateKey];
                const date = new Date(`${dateKey}T00:00:00Z`);

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


