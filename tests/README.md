# Test Suite

This directory contains standalone test scripts for independently testing each component of the Slack Calendar Autobot.

## Test Files

### Unit Tests (No credentials required)

1. **test-time.js** - Tests date range calculations and formatting
   ```bash
   node tests/test-time.js
   ```

2. **test-formatters.js** - Tests Slack Block Kit message formatting
   ```bash
   node tests/test-formatters.js
   ```

3. **test-milestones.js** - Tests milestone detection logic
   ```bash
   node tests/test-milestones.js
   ```

### Integration Tests (Requires credentials)

4. **test-calendar.js** - Tests Google Calendar API integration
   ```bash
   node tests/test-calendar.js
   ```
   Requires: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`

5. **test-slack.js** - Tests Slack API integration
   ```bash
   node tests/test-slack.js
   ```
   Requires: `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`

6. **test-endpoint.js** - Tests full end-to-end flow (without posting to Slack)
   ```bash
   node tests/test-endpoint.js daily
   node tests/test-endpoint.js weekly
   ```
   Requires: All environment variables

## Running All Tests

### Quick Test (No credentials)
```bash
node tests/test-time.js
node tests/test-formatters.js
node tests/test-milestones.js
```

### Full Test Suite
```bash
# Set up environment variables first
# Then run:
node tests/test-calendar.js
node tests/test-slack.js
node tests/test-endpoint.js daily
```

## Test Checklist

- [ ] Time utilities: date ranges, formatting
- [ ] Formatters: daily/weekly blocks, empty states
- [ ] Milestone detection: various patterns
- [ ] Calendar integration: fetch events (requires credentials)
- [ ] Slack integration: post messages (requires credentials)
- [ ] Full endpoint: end-to-end flow

## Tips

1. **Start with unit tests**: Run `test-time.js`, `test-formatters.js`, and `test-milestones.js` first - they don't require any credentials.

2. **Use a test calendar**: Create a separate Google Calendar for testing with a few sample events (including some with `[milestone]` in the title).

3. **Use a test Slack channel**: Create a private channel for testing to avoid spamming your main channels.

4. **Check logs**: All tests output detailed information to help debug issues.

5. **Environment variables**: Make sure your `.env` file is in the project root and contains all required variables.

