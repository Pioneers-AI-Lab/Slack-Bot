# Scripts

Helper scripts for testing and calling the API endpoint.

## call-endpoint.js

Node.js script to call the digest endpoint.

### Usage

```bash
# Call daily digest on local server (default)
node scripts/call-endpoint.js daily

# Call weekly digest on local server
node scripts/call-endpoint.js weekly

# Call with custom URL
node scripts/call-endpoint.js daily http://localhost:3000
node scripts/call-endpoint.js weekly https://your-project.vercel.app
```

### Using npm scripts

```bash
# Call daily digest (local)
npm run call:daily

# Call weekly digest (local)
npm run call:weekly

# Call production endpoint (set VERCEL_URL environment variable first)
export VERCEL_URL=https://your-project.vercel.app
npm run call:daily:prod
npm run call:weekly:prod

# Or pass URL directly as argument
node scripts/call-endpoint.js daily https://your-project.vercel.app
```

## call-endpoint.sh

Bash script alternative (requires `curl` and optionally `jq` for pretty JSON).

### Usage

```bash
# Make executable (first time only)
chmod +x scripts/call-endpoint.sh

# Call daily digest
./scripts/call-endpoint.sh daily

# Call weekly digest
./scripts/call-endpoint.sh weekly

# Call with custom URL
./scripts/call-endpoint.sh daily https://your-project.vercel.app
```

## Examples

### Test locally

```bash
# Start dev server in one terminal
npm run local

# In another terminal, call the endpoint
npm run call:daily
```

### Test production

```bash
# Update the URL in package.json scripts, then:
npm run call:daily:prod
```

### Quick curl test

```bash
# Local
curl http://localhost:3000/api/digest?mode=daily

# Production (replace with your URL)
curl https://your-project.vercel.app/api/digest?mode=daily
```

