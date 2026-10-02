// Which web permissions a page may use. Electron grants EVERY permission request to web content unless the
// app installs a handler, which would let any site open the camera, microphone or location silently.
// Until Ibon has per-site permission prompts (tasks.md, S-01), everything is denied except the few
// low-risk permissions ordinary sites need to work.
export const ALLOWED_PERMISSIONS = new Set([
  "fullscreen", // video players
  "clipboard-sanitized-write", // "copy" buttons (a page can write plain text, never read your clipboard)
  "pointerLock", // games and 3D viewers
]);

export const isPermissionAllowed = (permission) => ALLOWED_PERMISSIONS.has(permission);
