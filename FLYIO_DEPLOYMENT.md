# RSC Server - Fly.io + Cloudflare Deployment Guide

## Quick Deploy

Run this command from the `rsc-cloudflare` directory:

```bash
deploy-flyio.bat
```

This will:
1. Install Fly CLI (if needed)
2. Set Cloudflare secrets for state sync
3. Deploy the server to Fly.io

## Manual Deployment Steps

### 1. Install Fly CLI

```powershell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Create or Select App

First time:
```bash
cd rsc-cloudflare
fly launch --no-deploy
```

Follow prompts, select region (closest to your players).

### 4. Set Secrets

```bash
fly secrets set CLOUDFLARE_ACCOUNT_ID=6872653edcee9c787c1b783173793
fly secrets set CLOUDFLARE_KV_NAMESPACE_ID=f2881801ac59415a86236d0841f27103
fly secrets set CLOUDFLARE_API_TOKEN=9edfd6891042bede27f3899e34a057b7a5683
```

### 5. Deploy

```bash
fly deploy
```

### 6. Check Status

```bash
fly status
fly logs
```

## Architecture

```
                         ┌─────────────────┐
                         │   RSC Client    │
                         │   (Browser)     │
                         └────────┬────────┘
                                  │
                Health Check ─────┤
                (every 5s)        │
                                  │
            ┌─────────────────────┴──────────────────────┐
            │                                             │
            ▼                                             ▼
   ┌────────────────┐                          ┌──────────────────┐
   │  Fly.io Server │                          │ Cloudflare       │
   │   (Primary)    │─────State Sync──────────▶│ Durable Objects  │
   │                │    (every 30s)           │   (Backup)       │
   └────────────────┘                          └──────────────────┘
          │                                              │
          │                                              │
          └──────────────────┬───────────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Cloudflare KV   │
                    │ (Player Data)   │
                    └─────────────────┘
```

## How It Works

1. **Primary Server (Fly.io)**
   - Runs RSC server with full game logic
   - WebSocket on port 43594
   - Syncs player state to Cloudflare KV every 30s

2. **Backup Server (Cloudflare DO)**
   - Activates if Fly.io is down
   - Read-only mode (view stats, can't do actions)
   - Uses same KV storage

3. **Client Failover**
   - Pings Fly.io every 5 seconds
   - Auto-switches to Cloudflare after 3 failed pings
   - Auto-recovers to Fly.io when available

## Monitoring

**Fly.io Dashboard:**
```bash
fly dashboard
```

**View Logs:**
```bash
fly logs
```

**SSH into Server:**
```bash
fly ssh console
```

**Scale Resources:**
```bash
fly scale vm shared-cpu-1x --memory 512
```

## Cost Management

Default config:
- 1 shared CPU
- 256MB RAM
- Should stay within free tier

To monitor costs:
```bash
fly dashboard
# Click "Billing" tab
```

## Troubleshooting

**Server not starting:**
```bash
fly logs
# Check for errors in state sync or server initialization
```

**State sync not working:**
- Verify Cloudflare API token has KV write permissions
- Check secrets: `fly secrets list`

**Client can't connect:**
- Verify firewall allows port 43594
- Check Fly.io status: `fly status`

**High costs:**
```bash
# Scale down if needed
fly scale count 1 --max-per-region=1
```

## Files Created

- `fly.toml` - Fly.io configuration
- `rsc-server/Dockerfile` - Container definition
- `rsc-server/src/fly-server.js` - Entry point with state sync
- `rsc-server/src/state-sync-client.js` - Cloudflare KV sync module
- `rsc-client/src/server-health-monitor.js` - Client failover logic
- `functions/api/game-health.js` - Health check API endpoint
- `deploy-flyio.bat` - One-click deployment script

## Next Steps

After deployment:
1. Test client connection
2. Verify state sync is working (check KV in Cloudflare dashboard)
3. Test failover (scale down Fly.io, client should switch to Cloudflare)
4. Test recovery (scale up Fly.io, client should switch back)
