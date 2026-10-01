# Ibon

**Intelligent Browser Open Network** — an open, intelligent gateway to the modern web.

A lightweight, developer-focused desktop browser. Real Chromium rendering (via Electron), a small React UI, and optional LLM integration. Open source and built to be hacked on.

## Features
- Tabs, address bar with search, back/forward/reload, DevTools
- **Read mode** — per-tab toggle that loads text only (blocks images, media, fonts) and shows a clean reader view
- **Tracker blocking** built in
- **Assistant sidebar** — bring your own LLM: OpenAI, Claude, Grok, DeepSeek, Kimi, GLM, Ollama/local, or any OpenAI-compatible endpoint. The assistant can open URLs, toggle read mode, summarize and copy page text
- **Dev tools panel** — DNS, headers, ping, RDAP lookups, and webhooks (n8n, Zapier, custom)
- API keys are encrypted with your OS keychain and never leave your device except to your chosen provider

## Run it
Requires Node 20+.

```sh
npm install
npm run dev      # hot-reloading dev mode
npm start        # build and launch
```

## Layout
- `electron/` — main process: tabs, request filtering, IPC, LLM calls
- `src/` — React UI (tab strip, toolbar, reader, sidebar)
- `chromium/` — small slice of upstream Chromium source (`content/shell` and a few components) kept as **reference only**; it is not compiled

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
BSD-3-Clause. Files under `chromium/` keep their original Chromium license.
