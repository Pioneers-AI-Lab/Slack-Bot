# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a serverless Slack Calendar Autobot that automatically posts daily and weekly digests of Google Calendar events to Slack channels. It runs on Vercel with cron triggers and requires zero manual intervention.

## Key Commands

### Development
```bash
npm run local          # Start Vercel dev server (localhost:3000)
npm test              # Run all tests using Node's built-in test runner
```

### Testing Endpoints
```bash
# Test locally (requires dev server running)
curl http://localhost:3000/api/digest?mode=daily
curl http://localhost:3000/api/digest?mode=weekly

# Using npm scripts
npm run call:daily    # Test daily digest locally
npm run call:weekly   # Test weekly digest locally

# Test production endpoint
VERCEL_URL=https://your-project.vercel.app npm run call:daily:prod
```

### Unit Tests (No credentials required)
```bash
node tests/test-time.js          # Test date range calculations and formatting
node tests/test-formatters.js    # Test Slack message formatting
node tests/test-milestones.js    # Test milestone detection logic
```

### Integration Tests (Requires credentials in .env)
```bash
node tests/test-calendar.js      # Test Google Calendar API
node tests/test-slack.js         # Test Slack API
node tests/test-endpoint.js daily   # Test full end-to-end daily flow
node tests/test-endpoint.js weekly  # Test full end-to-end weekly flow
```

### Deployment
```bash
npm run deploy        # Deploy to Vercel
```

## Architecture

### Request Flow
1. **Entry Point**: `/api/digest.js` - Vercel serverless function handler
   - Triggered by GET request with `?mode=daily` or `?mode=weekly`
   - Can be invoked via Vercel cron jobs or manual HTTP calls
   - Handles URL parsing (supports both full URLs and relative paths for cron compatibility)

2. **Date Range Calculation**: `src/utils/time.js`
   - `getDailyDateRange()`: Returns today's start/end in UTC
   - `getWeeklyDateRange()`: Returns Monday-Sunday range (7 days)

3. **Calendar Fetching**: `src/calendar/google.js`
   - Authenticates via Google Service Account using JWT
   - Fetches events from Google Calendar API
   - Automatically separates events into milestones and regular events
   - Milestone detection: events containing `[milestone]` or `milestone:` (case-insensitive)

4. **Message Formatting**: `src/utils/formatters.js`
   - Converts events into Slack Block Kit format
   - `formatDailyDigest()`: Single day view with milestones section
   - `formatWeeklyDigest()`: Grouped by day with milestones section
   - Event format includes: random emoji, title (bold), location/time metadata, short description

5. **Slack Posting**: `src/services/slack.js`
   - Posts formatted blocks to configured Slack channel
   - Optionally notifies admin channel on errors

### Key Design Patterns

**Service Account Authentication**: Google Calendar is accessed via a service account with JWT authentication. The calendar must be explicitly shared with the service account email.

**Milestone Detection**: Events are classified as milestones by checking if title or description contains `[milestone]` or `milestone:`. This happens in `src/calendar/google.js:isMilestone()`.

**Event Description Handling**: Event descriptions are split at the first double newline (`\n\n`):
- **Short description** (before first `\n\n`): Displayed in digest with 4-space indentation
- **Long description** (after first `\n\n`): Ignored (reserved for future use)

**Client Singleton Pattern**: Both Google Calendar and Slack API clients are initialized once and cached in module-level variables to avoid recreating on every request.

**UTC Time Handling**: All date calculations use UTC methods (`getUTCDate()`, `getUTCMonth()`, etc.) to ensure consistent behavior regardless of server timezone.

## Environment Variables

Required variables (set in `.env` for local development, or Vercel dashboard for production):

```bash
# Google Calendar
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Slack
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=C1234567890

# Optional: Admin notifications
SLACK_ADMIN_CHANNEL_ID=C0987654321
```

**Important**: `GOOGLE_PRIVATE_KEY` must include `\n` characters for line breaks, or actual newlines if loaded from a file. The code automatically replaces `\\n` with actual newlines.

## Cron Configuration

Cron jobs are defined in `vercel.json`:
- Daily digest: `0 8 * * *` (08:00 UTC) → `/api/digest?mode=daily`
- Weekly digest: `0 9 * * 1` (09:00 UTC on Monday) → `/api/digest?mode=weekly`

## Testing Strategy

When testing:
1. Start with unit tests (`test-time.js`, `test-formatters.js`, `test-milestones.js`) - no credentials needed
2. Create a separate Google Calendar for testing with sample events (include some with `[milestone]` in title)
3. Use a private Slack channel for integration testing
4. Test files load `.env` from project root - ensure you're running tests from the project root directory

## Common Gotchas

- **Test file paths**: Tests must be run from the project root, not from the `tests/` directory, as they load `.env` from the current working directory.
- **Private key formatting**: The `GOOGLE_PRIVATE_KEY` must include the full key including the header/footer lines, with proper newline characters.
- **Calendar permissions**: The service account email must be explicitly added to the Google Calendar with "See all event details" permission.
- **Slack bot permissions**: Bot must have `chat:write` and `chat:write.public` scopes.
- **URL parsing**: The digest endpoint handles both full URLs and relative paths to support different invocation methods (direct HTTP vs Vercel cron).

## File Structure

```
api/
  digest.js              # Main serverless function endpoint
src/
  calendar/
    google.js           # Google Calendar API client and milestone detection
  services/
    slack.js            # Slack API client and error notifications
  utils/
    formatters.js       # Slack Block Kit message formatting
    time.js             # Date range calculations and formatting
    logger.js           # Simple logging utility
scripts/
  call-endpoint.js      # Helper script to test endpoints
tests/
  test-*.js             # Unit and integration tests
vercel.json             # Vercel deployment and cron configuration
```
