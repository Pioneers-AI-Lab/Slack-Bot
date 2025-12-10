// Test the milestone detection logic
function isMilestone(event) {
  const title = event.summary || '';
  const description = event.description || '';
  const text = `${title} ${description}`.toLowerCase();
  return text.includes('[milestone]') || text.includes('milestone:');
}

const testCases = [
  { summary: 'Project Launch [milestone]', description: '', expected: true },
  { summary: 'Regular Meeting', description: '', expected: false },
  { summary: 'Important Event', description: 'milestone: This is important', expected: true },
  { summary: 'Milestone: Release v1.0', description: '', expected: true },
  { summary: 'Team Lunch', description: 'Just a regular lunch', expected: false },
  { summary: 'MILESTONE: All caps', description: '', expected: true },
  { summary: 'Event with [milestone] in description', description: 'This is a [milestone] event', expected: true },
  { summary: 'Normal event', description: 'No milestone here', expected: false },
  { summary: 'milestone:', description: 'Just the keyword', expected: true },
  { summary: 'Event milestone', description: 'Word milestone without brackets', expected: false },
];

console.log('=== Testing Milestone Detection ===\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, i) => {
  const result = isMilestone(test);
  const status = result === test.expected;
  const icon = status ? '✅' : '❌';
  
  console.log(`${icon} Test ${i + 1}: "${test.summary}"`);
  if (!status) {
    console.log(`   Expected: ${test.expected}, Got: ${result}`);
    console.log(`   ⚠️  FAILED!`);
    failed++;
  } else {
    passed++;
  }
});

console.log();
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? '✅ All milestone detection tests passed!' : '❌ Some tests failed');

