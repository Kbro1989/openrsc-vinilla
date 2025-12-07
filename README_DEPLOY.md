# Deployment Instructions

The authentic RuneScape Classic client has been prepared in the `public` directory.
However, due to issues with the Node.js environment (npm/node not found), the automated deployment could not be completed.

## Manual Deployment

Please run the following command in this directory (`rsc-cloudflare`) to deploy to Cloudflare Pages:

```bash
npx wrangler pages deploy public --project-name rsc-authentic-client --branch main
```

Or if you have `wrangler` installed globally:

```bash
wrangler pages deploy public --project-name rsc-authentic-client --branch main
```

## Setup Details

- **Assets**: Authentic RSC assets (config, media, models, etc.) have been copied to `public/` and `public/data204/`.
- **Client**: The `rsc-client` build (`index.bundle.js` and `index.html`) is in `public/`.
- **Configuration**: A `wrangler.toml` and `package.json` have been created for convenience.

## Troubleshooting

If you encounter issues with `npx` or `npm`, ensure that Node.js is correctly installed and added to your system's PATH.
