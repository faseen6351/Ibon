# Sourcing register

Everything Ibon borrows, ports or depends on, with where it came from and under what licence. A pull request that
brings in outside code or data adds a row here. The rules are in [tasks.md](../tasks.md) (decision D4): code we
copy, port or depend on must allow commercial use and must not force Ibon itself to change licence.

"Checked" means the licence text or package metadata was read on the date shown, not recalled from memory.

## What ships inside the app

| Item | Licence | How it is used | Checked |
| --- | --- | --- | --- |
| [Electron](https://www.electronjs.org/) 44 | MIT | The application shell. Electron's own `LICENSE` and Chromium's `LICENSES.chromium.html` are included in every build. | 2026-10-02 |
| [Chromium](https://www.chromium.org/) 152 (inside Electron) | BSD-3-Clause and the licences of its bundled components | The rendering engine. Not modified. | 2026-10-02 |
| [PDFium](https://pdfium.googlesource.com/pdfium/) (inside Chromium) | BSD-3-Clause (checked in a local copy of the source) | PDF viewing, through Chromium's built-in PDF viewer. We **use** it; no PDFium code is copied or compiled by Ibon. | 2026-10-02 |
| [Crashpad](https://chromium.googlesource.com/crashpad/crashpad/) (inside Electron) | Apache-2.0 (checked in a local copy of the source) | Crash reports, through Electron's `crashReporter`. We **use** it; no Crashpad code is copied or compiled by Ibon. | 2026-10-02 |
| [React](https://react.dev/) and `react-dom` 19 | MIT | UI library, bundled into `dist/` by Vite. | 2026-10-02 |
| Ibon logo artwork (`assets/brand/`, `build/icon.png`) | Provided by the project owner | App icon, wordmark and in-app mark. | n/a |

## Build and development tools (not shipped)

| Item | Licence | Checked |
| --- | --- | --- |
| Vite 7, `@vitejs/plugin-react` | MIT | 2026-10-02 |
| TypeScript 5 | Apache-2.0 | 2026-10-02 |
| electron-builder 26 | MIT | 2026-10-02 |
| Remaining transitive dev dependencies | MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, BlueOak-1.0.0, 0BSD, Python-2.0, WTFPL, CC-BY-4.0 (browser-support data). No GPL, LGPL or AGPL. | 2026-10-02 |

## Reference only (not part of the build)

Local checkouts of other projects (Chromium, PDFium, Crashpad, Min) were used to read how upstream behaves. They are
not part of this repository and should be kept outside the editor workspace.

| Item | Licence | Notes |
| --- | --- | --- |
| `chromium/` in this repository | Chromium's licence, kept at `chromium/LICENSE` | A trimmed slice of upstream Chromium used for reading and for porting behaviour. Never compiled. Do not edit it except through a documented update from upstream. |
| Local copies of the Chromium, PDFium and Crashpad source | See above | Used to read how upstream behaves. Keep them outside the editor workspace; Chromium alone is about half a million files. |

## Ported code

| Ibon file | Ported from | Licence | Notes |
| --- | --- | --- | --- |
| `electron/permission-manager.mjs` | Min `main/permissionManager.js` ([minbrowser/min](https://github.com/minbrowser/min) at 1.35.7, commit `c92079c`) | Apache-2.0 (no NOTICE file) | A rewrite of the rules, not a copy: ask per site, a grant lasts for the page, sub-frames refused, revoked on navigation. Changes: grants per tab, merged media types, duplicate prompts share one answer, Block remembered for the page, origins normalised. Credited in `THIRD_PARTY_NOTICES.md`, licence text in `LICENSES/Apache-2.0.txt`. |

## Studied, not (yet) used

Licences read from each repository on 2026-10-02. "Take" lists what Ibon may reimplement or depend on.

| Project | Licence | Take | Task |
| --- | --- | --- | --- |
| [Min](https://github.com/minbrowser/min) | Apache-2.0 | URL and search detection (`js/util/urlParser.js`, with its HTTPS-upgrade list), search keywords and bangs, full-text history search, tab groups ("Tasks"), find in page, download manager, session restore, userscripts, reader-mode decision, keyboard shortcuts | C-01, C-02, C-04 to C-08, C-10, X-02, AI-25 |
| [DuckDuckGo privacy extension](https://github.com/duckduckgo/duckduckgo-privacy-extension) | Apache-2.0 | Privacy dashboard ideas, referrer and tracking-parameter protections | V-04, V-08 |
| [DuckDuckGo autoconsent](https://github.com/duckduckgo/autoconsent) | MPL-2.0 | Auto-dismiss cookie banners, as an unmodified dependency | new (V-11) |
| [Dark Reader](https://github.com/darkreader/darkreader) | MIT | Per-site page dark mode | new (U-10) |
| [Vimium](https://github.com/philc/vimium) | MIT | Keyboard link hints | C-10 |
| [Brave](https://github.com/brave/brave-core) and [adblock-rust](https://github.com/brave/adblock-rust) | MPL-2.0 | Shields design; fast native filter engine as a fallback | V-01 |
| [Ghostery adblocker](https://github.com/ghostery/adblocker) | MPL-2.0 | The filter engine itself, as a dependency | V-01 |
| [PDF.js](https://github.com/mozilla/pdf.js) | Apache-2.0 | PDF text extraction for the assistant | C-21 |
| [Readability](https://github.com/mozilla/readability) | Apache-2.0 | Better article extraction | AI-25 |
| [Ferdium](https://github.com/ferdium/ferdium-app) | Apache-2.0 | Web apps as side panels with their own sessions | A-07 |
| [Puppeteer](https://github.com/puppeteer/puppeteer), [Playwright](https://github.com/microsoft/playwright) | Apache-2.0 | Browser-automation design for the assistant and MCP | AI-22, M-01 |
| [web-vitals](https://github.com/GoogleChrome/web-vitals) | Apache-2.0 | Core Web Vitals in the Checkup | AI-10 |
| [ungoogled-chromium](https://github.com/ungoogled-software/ungoogled-chromium) | BSD-3-Clause | Checklist of Google endpoints to confirm are absent | S-12 |
| [Zen browser](https://github.com/zen-browser/desktop) | MPL-2.0 | Workspace and layout ideas only (a Firefox fork) | U-02 |
| [Beaker](https://github.com/beakerbrowser/beaker) | MIT (archived) | Ideas only | |

## Looked at and excluded

| Project | Licence | Why |
| --- | --- | --- |
| [uBlock Origin](https://github.com/gorhill/uBlock) | GPL-3.0 | Copyleft. Its filter syntax and public lists are usable as data; its code is not. |
| [qutebrowser](https://github.com/qutebrowser/qutebrowser) | GPL-3.0 | Copyleft. Keyboard-driven design may be reimplemented from the idea. |
| [Agregore](https://github.com/AgregoreWeb/agregore-browser) | AGPL-3.0 | Network copyleft. |
| [electron-browser-shell](https://github.com/samuelmaddock/electron-browser-shell) (`electron-chrome-extensions`) | GPL-3.0 | Copyleft. Use Electron's own `session.loadExtension` instead. |
| DuckDuckGo Tracker Radar | CC BY-NC-SA 4.0 | Non-commercial. |
| [Privacy Badger](https://github.com/EFForg/privacybadger) | Not detected by GitHub; the project is understood to be GPL | Treated as excluded until the licence is confirmed. |

## The original Aura prototype (`aura-browser`)

Ibon began as a Lovable-generated prototype (Aura, later Aether). Everything useful was carried over: Read mode
extraction, the tracker list, the LLM provider presets, the DNS, headers, ping and RDAP tools, and the webhook sender.
What is left is Lovable and TanStack scaffolding, about 50 generic UI components, an IP lookup, a port scanner that
probes arbitrary hosts (Ibon will only ever probe `localhost`, see ML-01), and a four-characters-per-token estimate
(to be reused for the usage meter, AI-04). Nothing there needs porting. The prototype remains on GitHub.

## Decisions recorded here

- **Crash reporting and PDF viewing use what Electron already ships.** Compiling Crashpad or PDFium ourselves would add
  a native build chain and a second copy of code that is already in the app, with no capability gained. Ibon adds the
  parts upstream does not provide: recovering a crashed tab and showing where reports are kept.
- **Crashpad's retention is not re-implemented.** Its handler prunes its own database when it grows past 128 MB or a
  report is older than 365 days, and the handler inside Electron is the same code.
