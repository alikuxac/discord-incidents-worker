# Discord Incident Worker

Hey there! 👋 This project is an open source Discord incidents monitor, built with Cloudflare Workers and TypeScript. It automatically tracks Discord service incidents and can be customized for your own monitoring or notification needs.

## What is this?

This repo contains a Cloudflare Worker (written in TypeScript) that monitors Discord's status and incidents. It's designed for automation, alerting, or integrating with other tools—perfect for anyone who wants to keep tabs on Discord's uptime and issues.

## Getting Started

You'll need [Wrangler](https://github.com/cloudflare/wrangler) (v1.17+). Install it, connect to your Cloudflare account, and deploy the worker.

```bash
wrangler publish
```

## Development

- Main entry: [`src/index.ts`](./src/index.ts)
- Handler: [`src/handler.ts`](./src/handler.ts)
- Monitors Discord incidents and returns relevant status info

## Testing

Run tests with Jest:

```bash
npm test
```

## Formatting

Keep your code pretty with Prettier:

```bash
npm run format
```

## Preview & Deploy

Use Wrangler to preview and publish your worker. See [Wrangler commands](https://developers.cloudflare.com/workers/tooling/wrangler/commands/#publish) for details.

## Issues & Feedback

Found a bug or have an idea? File an issue or open a PR—everyone's welcome!

## Caveats

Tests use `service-worker-mock`, which is close but not identical to the real Cloudflare runtime. Always test with `wrangler dev` and, if possible, a staging environment before deploying.

---

Happy coding! 🚀
