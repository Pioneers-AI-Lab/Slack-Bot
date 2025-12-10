import { formatDailyDigest, formatWeeklyDigest } from '../src/utils/formatters.js';

// Mock event data
const mockEvents = [
  {
    summary: 'Team Meeting',
    description: 'Weekly sync with the team',
    start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
    end: { dateTime: new Date(Date.now() + 7200000).toISOString() }
  },
  {
    summary: 'Lunch Break',
    description: 'Time to eat',
    start: { date: '2024-01-15' } // All-day event
  },
  {
    summary: 'Code Review',
    start: { dateTime: new Date(Date.now() + 10800000).toISOString() },
    end: { dateTime: new Date(Date.now() + 12600000).toISOString() }
  }
];

const mockMilestones = [
  {
    summary: 'Project Launch [milestone]',
    description: 'Major release milestone for Q1',
    start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
    end: { dateTime: new Date(Date.now() + 86400000 + 3600000).toISOString() }
  },
  {
    summary: 'milestone: Beta Release',
    description: 'Beta version goes live',
    start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
    end: { dateTime: new Date(Date.now() + 172800000 + 7200000).toISOString() }
  }
];

console.log('=== Testing Formatters ===\n');

// Test daily digest
console.log('1. Daily Digest Blocks:');
const dailyBlocks = formatDailyDigest(mockEvents, mockMilestones);
console.log('   Block count:', dailyBlocks.length);
console.log('   First block type:', dailyBlocks[0]?.type);
console.log('   Has header:', dailyBlocks[0]?.type === 'header' ? '✅' : '❌');
console.log('   Has milestones section:', dailyBlocks.some(b => b.text?.text?.includes('Milestones')) ? '✅' : '❌');
console.log('   Has events section:', dailyBlocks.some(b => b.text?.text?.includes('Events')) ? '✅' : '❌');
console.log();

// Test weekly digest
console.log('2. Weekly Digest Blocks:');
const weeklyBlocks = formatWeeklyDigest(mockEvents, mockMilestones);
console.log('   Block count:', weeklyBlocks.length);
console.log('   First block type:', weeklyBlocks[0]?.type);
console.log('   Has header:', weeklyBlocks[0]?.type === 'header' ? '✅' : '❌');
console.log('   Has milestones section:', weeklyBlocks.some(b => b.text?.text?.includes('Milestones')) ? '✅' : '❌');
console.log('   Has events section:', weeklyBlocks.some(b => b.text?.text?.includes('Events')) ? '✅' : '❌');
console.log();

// Test empty state
console.log('3. Empty State (No Events):');
const emptyDaily = formatDailyDigest([], []);
const emptyWeekly = formatWeeklyDigest([], []);
console.log('   Daily empty blocks:', emptyDaily.length);
console.log('   Weekly empty blocks:', emptyWeekly.length);
console.log('   Daily has empty message:', emptyDaily.some(b => b.text?.text?.includes('No events')) ? '✅' : '❌');
console.log('   Weekly has empty message:', emptyWeekly.some(b => b.text?.text?.includes('No events')) ? '✅' : '❌');
console.log();

// Test with only milestones
console.log('4. Only Milestones:');
const onlyMilestones = formatDailyDigest([], mockMilestones);
console.log('   Has milestones, no events section:', 
  onlyMilestones.some(b => b.text?.text?.includes('Milestones')) && 
  !onlyMilestones.some(b => b.text?.text?.includes('Today\'s Events')) ? '✅' : '❌');
console.log();

// Test with only events
console.log('5. Only Events:');
const onlyEvents = formatDailyDigest(mockEvents, []);
console.log('   Has events, no milestones section:', 
  onlyEvents.some(b => b.text?.text?.includes('Events')) && 
  !onlyEvents.some(b => b.text?.text?.includes('Milestones')) ? '✅' : '❌');
console.log();

// Display sample block structure
console.log('6. Sample Block Structure (first 2 blocks):');
console.log(JSON.stringify(dailyBlocks.slice(0, 2), null, 2));
console.log();

console.log('✅ Formatters test complete!');

