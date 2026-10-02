# How Ibon is licensed, and why

This page explains the licensing model in plain words. It is practical guidance, not legal advice; if a decision
matters commercially, ask a lawyer who knows open-source licensing.

## The goal

Anyone can use Ibon for anything: personal use, work, a commercial product, a closed-source fork. Nobody has to ask,
and nobody has to publish their changes. That is what a **permissive** licence gives, so Ibon's own code is under the
[BSD 3-Clause licence](../LICENSE). The only strings: keep the copyright notice and the licence text with the code,
and do not use the project's name to endorse a product without permission.

## What goes in, and what stays out

Ibon only takes in code whose licence is just as free:

| Licence | In Ibon? | Why |
| --- | --- | --- |
| MIT, BSD, ISC, Apache-2.0, 0BSD, Unlicense, CC0 | Yes | Permissive. Keep their notices (see [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)). |
| MPL-2.0 | Yes, as an unmodified dependency | Copyleft only per file: if we edit an MPL file, that file stays MPL and its changes are published. Everything else is untouched. |
| GPL, LGPL, AGPL | No | Copyleft: the whole combined program would have to be released under the same licence. That removes the freedom described above. |
| Non-commercial or no-derivatives terms (CC BY-NC and similar), or no licence at all | No | Not free to use for anything, or not licensed to copy. |

The CI licence check (tasks.md, P0-07) turns this table into a build failure.

## "Can we use GPL code and just add another licence?"

It does not work that way, and it is worth being exact about why.

- **Dual or multi-licensing is something a copyright holder does with their own code.** A project can offer its own
  code under two licences. You can do that with code you wrote. You cannot do it with someone else's GPL code,
  because you do not hold the right to relicense it.
- **GPL code stays GPL.** If GPL code is part of Ibon, the combined program can only be distributed under the GPL.
  Listing a second licence next to it does not change that: the GPL terms still apply to the whole, so downstream
  users could no longer make a closed-source fork. That is the opposite of the goal above.
- **AGPL goes further.** Anyone who runs a modified version as a network service must publish their changes.

So the choice is between keeping Ibon permissive (and borrowing only permissive code) or making the whole project
GPL. This project chooses permissive.

## If GPL functionality is ever wanted

The honest options, in order of preference:

1. **Reimplement the idea.** Ideas, behaviours and file formats are not copyrighted; only the code is. Writing it
   fresh, without copying or closely following the GPL source, keeps Ibon permissive. Most GPL browser features
   (uBlock Origin's filter syntax, qutebrowser's keyboard model) can be done this way, or with a permissive library
   that already exists (for example the MPL-2.0 `@ghostery/adblocker`).
2. **A separate optional add-on.** A GPL extension in its own repository, installed by the user, running as a
   separate program, and talking to Ibon through a public interface, can carry its own licence without changing
   Ibon's. Where exactly the line sits between "separate" and "combined" is a legal question, so get advice before
   relying on it.
3. **Make the whole project GPL.** Legitimate, but it ends the "use it for anything" promise, and every contributor
   to date would need to agree.

## Many licences in one repository is normal

A permissive project can contain files under different permissive licences. The rule is that each file's licence
travels with it:

- Ibon's own files: BSD-3-Clause (the root [LICENSE](../LICENSE)).
- Files derived from another project (for example `electron/permission-manager.mjs`, from Min): carry that project's
  licence, named in an `SPDX-License-Identifier:` line in the file header and credited in
  [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). The licence text lives in [LICENSES/](../LICENSES/).
- `chromium/`: Chromium's own licence, in `chromium/LICENSE`.
- Every borrowed item gets a row in [docs/sourcing.md](sourcing.md).

## What to do when you contribute

- Write the code yourself, or bring in only what the table above allows.
- If you derive code from another project, say so in the file header, add the SPDX line, and add a row to
  `docs/sourcing.md`.
- By contributing you agree your contribution is released under the project's licence.
