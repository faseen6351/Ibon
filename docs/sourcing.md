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

| Item | Licence | Notes |
| --- | --- | --- |
| `chromium/` in this repository | Chromium's licence, kept at `chromium/LICENSE` | A trimmed slice of upstream Chromium used for reading and for porting behaviour. Never compiled. Do not edit it except through a documented update from upstream. |
| Local copies of the Chromium, PDFium and Crashpad source | See above | Used to read how upstream behaves. Keep them outside the editor workspace; Chromium alone is about half a million files. |

## Ported code

| Ibon file | Ported from | Licence | Notes |
| --- | --- | --- | --- |
| _none yet_ | | | The first ports (see tasks.md, C-01 onwards) will be listed here with their upstream path and revision. |

## Decisions recorded here

- **Crash reporting and PDF viewing use what Electron already ships.** Compiling Crashpad or PDFium ourselves would add
  a native build chain and a second copy of code that is already in the app, with no capability gained. Ibon adds the
  parts upstream does not provide: recovering a crashed tab and showing where reports are kept.
- **Crashpad's retention is not re-implemented.** Its handler prunes its own database when it grows past 128 MB or a
  report is older than 365 days, and the handler inside Electron is the same code.
