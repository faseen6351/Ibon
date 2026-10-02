# Third-party notices

Ibon's own code is under the [BSD 3-Clause licence](LICENSE). Ibon also contains, or is built on, the software below.
Each is used under its own licence, which is reproduced or referenced here as that licence requires. This file is
shipped inside every Ibon installer. The full register, including build-time tools, is in
[docs/sourcing.md](docs/sourcing.md).

## Shipped inside the app

### Electron and Chromium

Ibon runs on [Electron](https://www.electronjs.org/) (MIT licence), which bundles
[Chromium](https://www.chromium.org/) and many components under their own licences. These include PDFium
(BSD-3-Clause, the PDF viewer) and Crashpad (Apache-2.0, the crash reporter). The complete texts are included in
every Ibon install, next to the application, in:

- `LICENSE.electron.txt` (Electron's licence)
- `LICENSES.chromium.html` (the licences of Chromium and everything bundled in it)

### React and React DOM

Copyright (c) Meta Platforms, Inc. and affiliates. MIT licence. Both are compiled into Ibon's interface.

```
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Derived from other open-source projects

### Min (Apache-2.0)

`electron/permission-manager.mjs` reimplements the permission-prompt rules of
[Min](https://github.com/minbrowser/min)'s `main/permissionManager.js` (ask per site, an allow lasts for the current
page, sub-frames are refused, grants are revoked on navigation). It is a rewrite with changes, stated in the file's
header, not a verbatim copy. Min is licensed under the Apache License 2.0; the licence text is in
[LICENSES/Apache-2.0.txt](LICENSES/Apache-2.0.txt). Min publishes no NOTICE file.

### Chromium (BSD-3-Clause)

`chromium/` in the source repository is an unmodified slice of upstream Chromium, kept for reference and never
compiled into Ibon. It keeps its own licence in [chromium/LICENSE](chromium/LICENSE). Code ported from it into Ibon
will name the upstream file in its header.
