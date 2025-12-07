# Free Global Multiplayer - Self-Host with Cloudflare Tunnel

## What This Does
- ✅ Run RSC server on your PC (Windows)
- ✅ Cloudflare Tunnel exposes it globally (FREE, no card!)
- ✅ Players connect via WebSocket from anywhere
- ✅ **$0/month**, unlimited players

---

## Step 1: Install Cloudflare Tunnel

```powershell
# Run in PowerShell (Admin)
winget install --id Cloudflare.cloudflared
```

Or download: https://github.com/cloudflare/cloudflared/releases

---

## Step 2: Start Your RSC Server

```bash
cd c:\Users\Destiny\Desktop\ai-architect-mmorpg\copy-of-rsc-evolution-ai\rsc-cloudflare\rsc-server

# Install dependencies (if not done)
npm install

# Start server
node multiplayer-server.js
```

Server runs on `localhost:43594`

---

## Step 3: Create Cloudflare Tunnel

### Quick Mode (Temporary URL):
```bash
cloudflared tunnel --url http://localhost:43594
```

**Output:**
```
Your quick Tunnel has been created! Visit it at:
https://random-name.trycloudflare.com
```

✅ **That's your public WebSocket URL!** Players connect to it.

### Permanent Mode (Custom subdomain):
```bash
# Login to Cloudflare (free account, no card)
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create rsc-server

# Configure tunnel
cloudflared tunnel route dns rsc-server rsc.yourdomain.com

# Run tunnel
cloudflared tunnel run rsc-server
```

---

## Step 4: Update Game Client

Edit client to connect to tunnel URL:

```javascript
// Instead of Web Worker
const ws = new WebSocket('wss://random-name.trycloudflare.com');
```

---

## Step 5: Keep Server Running

### Option A: Run When You Play
Just start server + tunnel when you want to play

### Option B: Always-On PC
```bash
# Install PM2
npm install -g pm2

# Run server with PM2
pm2 start rsc-server/multiplayer-server.js --name rsc

# Run tunnel with PM2
pm2 start cloudflared -- tunnel --url http://localhost:43594

# Save config
pm2 save
pm2 startup
```

---

## Pros & Cons

**Pros:**
- ✅ 100% free, forever
- ✅ No credit card
- ✅ Unlimited bandwidth
- ✅ Unlimited players
- ✅ Works immediately

**Cons:**
- ❌ Your PC must be running
- ❌ Temporary URL changes each restart (unless you use named tunnel)

---

## Alternative: Just Pay $5/Month for Cloudflare

**Cloudflare Workers Paid:**
- $5/month
- 10M requests (enough for 24/7 operation)
- Professional, always-on
- No PC needed

**Honestly:** If you want 24/7 uptime without your PC running, $5/month is reasonable.

---

## Which Option?

1. **Casual play with friends?** → Cloudflare Tunnel (free)
2. **24/7 public server?** → Cloudflare Workers ($5/month)
3. **Want zero cost forever?** → Cloudflare Tunnel + leave PC on

Choose what fits your needs!
