/**
 * Time utilities for date range calculations
 */

/**
 * Get date range for daily digest (today)
 * @returns {{start: Date, end: Date}} Start and end of today in UTC
 */
export function getDailyDateRange() {
  const now = new Date();
  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  const end = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59, 999
  ));
  return { start, end };
}

/**
 * Get date range for weekly digest (next 7 days from Monday)
 * @returns {{start: Date, end: Date}} Start of Monday and end of Sunday (7 days)
 */
export function getWeeklyDateRange() {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const daysUntilMonday = currentDay === 0 ? 1 : (currentDay === 1 ? 0 : 8 - currentDay);
  
  // Calculate Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + (currentDay === 0 ? 1 : (currentDay === 1 ? 0 : 8 - currentDay)));
  monday.setUTCHours(0, 0, 0, 0);
  
  // Calculate Sunday (6 days after Monday)
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time range for display
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {string} Formatted time range
 */
export function formatTimeRange(start, end) {
  const startTime = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const endTime = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${startTime} - ${endTime}`;
}

/**
 * Get week number for the given date
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number (1-52/53)
 */
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

