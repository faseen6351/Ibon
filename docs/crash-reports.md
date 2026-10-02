# Crash reports

Ibon records crashes on your device so bugs can be diagnosed. **Nothing is uploaded, ever, and there is no telemetry.**

## How it works

Electron includes Crashpad, the crash reporter Chromium uses. At startup Ibon calls it with uploads switched off, so
when any process crashes (the main process, a tab, the GPU process) Crashpad writes a small memory snapshot, a
"minidump" (`.dmp` file), into a folder on your computer. If only a tab crashes, that tab shows a notice with a
**Reload tab** button, and your other tabs keep working.

## Where the reports are

Open **Settings → Diagnostics → Open crash folder**, or look in:

| OS | Folder |
| --- | --- |
| Windows | `%APPDATA%\Ibon\Crashpad` |
| macOS | `~/Library/Application Support/Ibon/Crashpad` |
| Linux | `~/.config/Ibon/Crashpad` |

Crashpad deletes old reports on its own (when the folder passes 128 MB, or a report is older than 365 days). You can
also delete the files yourself whenever you like.

## Before you share one

A minidump can contain fragments of whatever was in memory when Ibon crashed, such as page text, URLs or tokens.
**Do not attach one to a public issue.** Describe what you were doing instead; if a maintainer needs a dump, share it
privately.

## For contributors

- Reports are produced by `crashReporter.start()` in `electron/main.mjs`. The helpers that find them are in
  `electron/crash-reports.mjs` and are covered by `electron/crash-reports.test.mjs`.
- `npm run smoke` crashes a tab on purpose and checks that the notice appears, that a report is written inside the
  throwaway profile, and that **Reload tab** recovers the page.
- Dumps are read with standard minidump tools, using the matching Electron symbols.
