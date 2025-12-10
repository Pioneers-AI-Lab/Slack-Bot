# Slack Calendar Autobot

Automated Slack digests from Google Calendar events. Posts daily and weekly digests to Slack channels with zero manual intervention.

## Features

- **Daily Digest**: Posted at 08:00 UTC with today's events and milestones
- **Weekly Digest**: Posted Monday at 09:00 UTC with the week's events and milestones
- **Automatic Milestone Detection**: Events containing `[milestone]` or `milestone:` are highlighted
- **Serverless**: Runs on Vercel with cron triggers
- **Zero Logging**: No data persistence (v0.9)

## Prerequisites

- Node.js 18+
- Google Cloud Project with Calendar API enabled
- Google Service Account with Calendar read permissions
- Slack Workspace with a Bot Token
- Vercel account (for deployment)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**
4. Create a **Service Account**:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name (e.g., "calendar-autobot")
   - Click "Create and Continue"
   - Skip role assignment, click "Done"
5. Generate a key:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Save the JSON file
6. Share your calendar with the service account:
   - Open Google Calendar
   - Go to calendar settings
   - Under "Share with specific people", add the service account email
   - Give it "See all event details" permission
7. Get your Calendar ID:
   - In calendar settings, find "Calendar ID" (format: `xxx@group.calendar.google.com`)

### 3. Slack Bot Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app or use an existing one
3. Go to "OAuth & Permissions"
4. Add the following Bot Token Scopes:
   - `chat:write`
   - `chat:write.public`
5. Install the app to your workspace
6. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
7. Get your Channel ID:
   - Right-click on the channel in Slack
   - Click "View channel details"
   - Scroll down to find the Channel ID (starts with `C`)

### 4. Environment Variables

Create a `.env` file in the project root (or set in Vercel):

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=C1234567890
SLACK_ADMIN_CHANNEL_ID=C0987654321  # Optional: for error notifications

# Google Calendar Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

**Important Notes:**
- `GOOGLE_PRIVATE_KEY` should include the full key with `\n` for newlines (or actual newlines if using a file)
- The service account email must have access to the calendar
- Channel IDs start with `C` for public channels

### 5. Local Development

```bash
npm run local
```

This starts Vercel dev server. Test the endpoint:

```bash
# Test daily digest
curl http://localhost:3000/api/digest?mode=daily

# Test weekly digest
curl http://localhost:3000/api/digest?mode=weekly
```

### 6. Deployment to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel:
   - Go to your project in Vercel dashboard
   - Settings > Environment Variables
   - Add all variables from `.env`

4. Verify cron jobs:
   - Go to Settings > Cron Jobs
   - You should see two cron jobs configured:
     - Daily: `0 8 * * *` → `/api/digest?mode=daily`
     - Weekly: `0 9 * * 1` → `/api/digest?mode=weekly` (1 = Monday)

## API Endpoint

### GET `/api/digest?mode=<daily|weekly>`

Generates and posts a digest to Slack.

**Query Parameters:**
- `mode` (required): `daily` or `weekly`

**Response (Success):**
```json
{
  "status": "sent",
  "digest_type": "daily",
  "events_count": 3,
  "milestones_count": 1
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Milestone Detection

Events are automatically detected as milestones if they contain:
- `[milestone]` in the title or description
- `milestone:` in the title or description

Case-insensitive matching.

## Project Structure

```
slack-calendar-autobot/
├── api/
│   └── digest.js          # Main API endpoint
├── src/
│   ├── calendar/
│   │   └── google.js      # Google Calendar API client
│   ├── services/
│   │   └── slack.js       # Slack API client
│   └── utils/
│       ├── formatters.js  # Digest formatting
│       ├── time.js        # Date utilities
│       └── logger.js      # Logging utility
├── package.json
├── vercel.json            # Vercel configuration
└── README.md
```

## Testing

### Manual Testing

1. **Test Calendar Fetch:**
   ```bash
   node -e "import('./src/calendar/google.js').then(m => m.fetchCalendarEvents(new Date(), new Date(Date.now() + 86400000)).then(console.log))"
   ```

2. **Test Slack Posting:**
   - Use the API endpoint with your test channel
   - Verify message format and content

3. **Test Cron Execution:**
   - Use Vercel's cron job testing feature
   - Or manually trigger: `curl https://your-app.vercel.app/api/digest?mode=daily`

### Integration Testing

Create a test script to verify end-to-end flow:

```javascript
// test-integration.js
import { fetchCalendarEvents } from './src/calendar/google.js';
import { getDailyDateRange } from './src/utils/time.js';

const { start, end } = getDailyDateRange();
const result = await fetchCalendarEvents(start, end);
console.log('Events:', result.events.length);
console.log('Milestones:', result.milestones.length);
```

## Troubleshooting

### "Missing Google Calendar credentials"
- Verify all `GOOGLE_*` environment variables are set
- Check that `GOOGLE_PRIVATE_KEY` includes the full key with proper formatting

### "Failed to fetch calendar events"
- Verify the service account email has access to the calendar
- Check that Calendar API is enabled in Google Cloud Console
- Ensure the calendar ID is correct

### "Failed to post to Slack"
- Verify `SLACK_BOT_TOKEN` is valid and not expired
- Check that the bot is installed in your workspace
- Ensure `SLACK_CHANNEL_ID` is correct
- Verify the bot has `chat:write` permission

### Cron jobs not running
- Check Vercel cron configuration in dashboard
- Verify the endpoint URL is correct
- Check Vercel function logs for errors

## Roadmap

- **v0.9** (Current): Minimal autonomous MVP with daily/weekly digests
- **v1.0**: Add logging (Notion + Airtable integration)
- **v1.1**: Interactive Slack commands
- **v2.0**: Multi-cohort and custom views

## License

MIT

