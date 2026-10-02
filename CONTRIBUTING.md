# Contributing to Ibon

Thanks for helping. Ibon stays small on purpose, so the bar for new code and new dependencies is "does this earn its place".

## Workflow

1. Pick a task from [tasks.md](tasks.md) (look for `gfi` for good first issues) and open an issue saying you are taking it.
2. Fork the repo and branch from `main`.
3. Make a small, focused change. Add or update tests.
4. Run the checks below, then open a pull request that says what changed and why.

## Run it and check it

```sh
npm install
npm run dev          # launch with hot reload
npm run typecheck
npm test             # unit tests (Node's built-in test runner, no extra framework)
npm run build && npm run smoke   # launches the real app and checks it end to end
```

`npm run smoke` is the one to run before a pull request that touches the app's behaviour. It crashes a tab on
purpose, opens each sidebar panel, loads a PDF, and checks that web pages are denied sensitive permissions. If you
fix a bug, add a check that fails without your fix.

## Rules of the road

- **Do not edit `chromium/`** except through a documented update from upstream. It is a read-only reference.
- **Licences.** Only bring in code or data whose licence allows commercial use and does not force Ibon to change
  licence: MIT, BSD, ISC, Apache-2.0 (and MPL-2.0 as an unmodified dependency). No GPL, LGPL or AGPL, and nothing
  non-commercial. Add a row to [docs/sourcing.md](docs/sourcing.md) for anything you borrow.
- **Porting from Chromium** means re-implementing the behaviour in TypeScript and porting upstream's unit-test
  cases, not pasting C++. Start each ported file with a comment naming the upstream path and licence.
- **Dependencies.** Justify every new one in the pull request. Prefer what Electron or Chromium already provides.
- **Security issues** go through [SECURITY.md](SECURITY.md), not a public issue.

Be respectful. Everyone is welcome.
