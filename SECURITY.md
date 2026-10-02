# Security policy

Ibon is an early alpha (0.0.x). It renders untrusted web content, so security reports are taken seriously.

## Reporting a vulnerability

**Please do not open a public issue.** Report it privately instead:

1. Go to the repository's **Security** tab and choose **Report a vulnerability** (GitHub private vulnerability reporting).
2. Include what you found, the Ibon version (Settings → Diagnostics shows it), your operating system, and the
   steps to reproduce it.

You can expect an acknowledgement within a few days. Fixes ship in the next release; crucial ones get their own.

## Supported versions

Only the latest release is supported. Ibon ships Chromium through Electron, so security releases of Electron are
picked up promptly: a known advisory against the bundled Electron blocks a release.

## Known gaps

The current known limitations are listed in the README under "Known limitations" and are tracked in
[tasks.md](tasks.md) (see the security baseline). You do not need to report those again.

## Crash reports

Crash reports stay on your computer and can contain fragments of memory. Do not attach one to a public issue. See
[docs/crash-reports.md](docs/crash-reports.md).
