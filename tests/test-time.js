import { 
  getDailyDateRange, 
  getWeeklyDateRange, 
  formatDate, 
  formatTimeRange, 
  getWeekNumber 
} from '../src/utils/time.js';

console.log('=== Testing Time Utilities ===\n');

// Test daily date range
console.log('1. Daily Date Range:');
const daily = getDailyDateRange();
console.log('   Start:', daily.start.toISOString());
console.log('   End:', daily.end.toISOString());
console.log('   Formatted:', formatDate(daily.start));
console.log();

// Test weekly date range
console.log('2. Weekly Date Range:');
const weekly = getWeeklyDateRange();
console.log('   Start (Monday):', weekly.start.toISOString());
console.log('   End (Sunday):', weekly.end.toISOString());
console.log('   Formatted Start:', formatDate(weekly.start));
console.log('   Formatted End:', formatDate(weekly.end));
console.log('   Days in range:', Math.ceil((weekly.end - weekly.start) / (1000 * 60 * 60 * 24)));
console.log();

// Test time range formatting
console.log('3. Time Range Formatting:');
const start = new Date('2024-01-15T14:30:00Z');
const end = new Date('2024-01-15T16:00:00Z');
console.log('   Time Range:', formatTimeRange(start, end));
console.log();

// Test week number
console.log('4. Week Number:');
const testDate = new Date();
console.log('   Current Date:', formatDate(testDate));
console.log('   Week Number:', getWeekNumber(testDate));
console.log();

// Validation tests
console.log('5. Validation:');
const now = new Date();
const dailyRange = getDailyDateRange();
const isToday = dailyRange.start.getUTCDate() === now.getUTCDate() &&
                dailyRange.start.getUTCMonth() === now.getUTCMonth() &&
                dailyRange.start.getUTCFullYear() === now.getUTCFullYear();
console.log('   Daily range starts today:', isToday ? '✅' : '❌');

const weeklyRange = getWeeklyDateRange();
const isMonday = weeklyRange.start.getUTCDay() === 1;
const isSunday = weeklyRange.end.getUTCDay() === 0;
console.log('   Weekly range starts on Monday:', isMonday ? '✅' : '❌');
console.log('   Weekly range ends on Sunday:', isSunday ? '✅' : '❌');

console.log('\n✅ Time utilities test complete!');

