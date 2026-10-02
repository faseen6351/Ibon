import type { PermissionRequest } from "../lib/api";

/** What the site wants, in words a person recognises. */
export function describe(req: Pick<PermissionRequest, "permission" | "mediaTypes">): string {
  if (req.permission === "notifications") return "show notifications";
  const video = req.mediaTypes.includes("video");
  const audio = req.mediaTypes.includes("audio");
  if (video && audio) return "use your camera and microphone";
  if (video) return "use your camera";
  return "use your microphone";
}

function hostOf(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

interface Props {
  request: PermissionRequest;
  /** How many other questions are waiting behind this one. */
  more: number;
  onRespond: (id: number, allow: boolean) => void;
}

// Sits between the toolbar and the page, so the native page view never covers it.
export function PermissionBar({ request, more, onRespond }: Props) {
  return (
    <div className="permbar" role="alert">
      <span className="permbar-text">
        <strong>{hostOf(request.origin)}</strong> wants to {describe(request)}
        {more > 0 ? <span className="muted"> (+{more} more)</span> : null}
      </span>
      <button className="pill on" onClick={() => onRespond(request.id, true)}>Allow</button>
      <button className="pill" onClick={() => onRespond(request.id, false)}>Block</button>
    </div>
  );
}
