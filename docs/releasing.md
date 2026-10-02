# Releasing Ibon

Versions start at **0.0.1**. Each crucial update bumps the patch (0.0.2, 0.0.3, …); a new capability bumps the minor
(0.1.0); 1.0.0 is the first release we call stable. Version numbers are `major.minor.patch` because npm, Electron and
Windows installers all require that shape.

## Cut a release

1. Make sure `main` is green in CI and `npm audit` reports nothing high. Ibon ships Chromium, so an Electron
   advisory means bumping Electron first.
2. Set the new version in `package.json` (and `package-lock.json`) and commit it:
   `npm version 0.0.2 --no-git-tag-version`.
3. Tag and push: `git tag v0.0.2 && git push origin v0.0.2`.
4. The **Release** workflow builds installers on Windows, macOS and Linux and attaches them to a **draft** release.
   It refuses to run if the tag does not match `package.json`.
5. Open the draft on GitHub, download one installer and run it, write the notes, then publish.

## Build locally

```sh
npm run pack   # unpacked app in release/<os>-unpacked, fast, for checking
npm run dist   # installers for the OS you are on, in release/
```

Run `IBON_EXE=release/win-unpacked/Ibon.exe npm run smoke` (path differs per OS) to check a packaged build end to end.

## Signing (not set up yet)

Installers are currently **unsigned**, so Windows SmartScreen and macOS Gatekeeper warn on first run. The README
explains how to get past that. Signing is tracked in tasks.md (R-03): a code-signing certificate for Windows, and an
Apple Developer account (about $99 a year) for macOS notarisation.
