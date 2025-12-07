# RSC Dashboard Deployment Guide

## Quick Deploy

1. **Navigate to project:**
   ```bash
   cd c:\Users\Destiny\Desktop\ai-architect-mmorpg\copy-of-rsc-evolution-ai\rsc-cloudflare
   ```

2. **Deploy dashboard to Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy public --project-name=rsc-dashboard
   ```

3. **Your dashboard will be available at:**
   ```
   https://rsc-dashboard.pages.dev
   ```

## Custom Domain (Optional)

Set up a custom domain like `play.your-domain.com`:

1. Go to Cloudflare Dashboard
2. Select your `rsc-dashboard` Pages project
3. Go to "Custom domains"
4. Add domain and follow DNS setup

## Architecture

```
Dashboard (Static Site)
└── https://rsc-dashboard.pages.dev
    └── Play Button → https://rscaievolution-png.pages.dev (Game)
```

**Benefits:**
- ✅ Separate deployments (update dashboard without touching game)
- ✅ Custom domain for marketing
- ✅ Fast static hosting
- ✅ Shows server stats from game server
