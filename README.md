# Ibon

**Intelligent Browser Open Network** — an open, intelligent gateway to the modern web.

Ibon is a lightweight, open-source desktop browser built for **developers**. It renders pages with real Chromium (through Electron) but wraps them in a small, hackable React UI, and adds the things developers keep reaching for other tools to do: text-only reading, network lookups, webhooks, and an AI assistant that can drive the browser, using whichever LLM you choose.

> Status: early (v0.1). It runs and is useful, but expect rough edges. Contributions welcome.

## Why Ibon

- **Light by design.** No sync service, no bundled bloat, no accounts. The whole UI is a few hundred lines of React.
- **Save data and tokens.** A per-tab **Read mode** blocks images, media and fonts and gives you clean text, which is also the cheapest thing to feed an LLM.
- **Bring your own LLM, or none.** Everything works without AI. If you want it, plug in ChatGPT, Claude, Grok, DeepSeek, Kimi, GLM, a local Ollama model, or any OpenAI-compatible endpoint.
- **A browser the AI can actually use.** The assistant sees the current page and can open URLs, toggle read mode, summarize and copy content.
- **Open.** BSD-3-Clause. Fork it, change it, ship it.

## Features

| Area | What you get |
| --- | --- |
| Browsing | Tabs, address bar with search, back / forward / reload, Chromium DevTools |
| Read mode | Text-only loading per tab, clean reader view, word and size stats |
| Privacy | Built-in tracker and ad-network blocking, with a per-tab blocked count |
| Assistant | Chat about the current page, summarize (short / medium / detailed), browser actions |
| Dev tools panel | DNS, response headers, ping and RDAP (whois) lookups for the current host |
| Automation | Send a page's readable text to any webhook (n8n, Zapier, custom) |
| Security | API keys encrypted with the OS keychain; sandboxed page views; only `http(s)` navigation |

## Getting started

Requires **Node.js 20+**.

```sh
git clone https://github.com/faseen6351/Ibon.git
cd Ibon
npm install
npm start        # build the UI and launch Ibon
```

For development with hot reload:

```sh
npm run dev
```

Other scripts: `npm run build` (UI bundle only), `npm run typecheck`.

### Connecting an LLM (optional)

Open the sidebar → **Settings**, pick a provider, set the model, and paste your API key. For a fully offline setup, install [Ollama](https://ollama.com), pull a model, and choose **Local / Ollama** — no key needed.

The assistant can control the browser by replying with action tags such as `[action:open_url https://…]`, `[action:read_mode]`, `[action:summarize medium]` and `[action:copy_content]`.

## How it works

```
┌────────────────────────── Electron main process ─────────────────────────┐
│ tabs (one Chromium view each) · tracker / read-mode request filter       │
│ settings + encrypted keys · LLM calls · DNS / headers / webhook tools    │
└───────────────▲──────────────────────────────────────────────────────────┘
                │ IPC (validated sender, contextIsolation, no node access)
┌───────────────┴───────── React UI (renderer) ────────────────────────────┐
│ tab strip · toolbar · reader view · sidebar (assistant / tools / settings)│
└──────────────────────────────────────────────────────────────────────────┘
```

```
electron/   main process: tabs, filtering, IPC, LLM + network tools
src/        React UI: App, Reader, Sidebar, typed IPC client
chromium/   reference slice of upstream Chromium (content/shell + a few
            components). Not compiled; for studying and borrowing ideas.
scripts/    dev and start launchers
```

## Roadmap

- Bookmarks, history and saved sessions
- Read mode and tracker blocking for background loads, plus per-site rules
- Automations (scheduled and page-triggered) and WhatsApp / chat sidebar
- Extensions-style plugin API for developer tools
- Packaged installers for Windows, macOS and Linux

## Contributing

Ibon stays small on purpose, so please justify new dependencies. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow. Issues and pull requests are welcome.

## License

BSD-3-Clause — see [LICENSE](LICENSE). Files under `chromium/` retain their original Chromium license ([chromium/LICENSE](chromium/LICENSE)). Ibon is not affiliated with or endorsed by Google or the Chromium project.
