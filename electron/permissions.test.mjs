import { test } from "node:test";
import assert from "node:assert/strict";

import { ALLOWED_PERMISSIONS, isPermissionAllowed } from "./permissions.mjs";

test("sensitive permissions are denied", () => {
  for (const p of ["media", "geolocation", "notifications", "clipboard-read", "display-capture", "midi", "midiSysex", "openExternal", "idle-detection", "window-management", "unknown"]) {
    assert.equal(isPermissionAllowed(p), false, p);
  }
});

test("only the low-risk permissions are allowed", () => {
  assert.deepEqual([...ALLOWED_PERMISSIONS].sort(), ["clipboard-sanitized-write", "fullscreen", "pointerLock"]);
  assert.equal(isPermissionAllowed("fullscreen"), true);
});

test("an unrecognised permission name is denied", () => {
  assert.equal(isPermissionAllowed("some-future-permission"), false);
  assert.equal(isPermissionAllowed(undefined), false);
});
