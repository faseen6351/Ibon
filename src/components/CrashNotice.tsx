// Shown in place of a tab's page when its renderer process died. The other tabs keep working.
const WHY: Record<string, string> = {
  crashed: "crashed",
  oom: "ran out of memory",
  killed: "was closed by the system",
  "abnormal-exit": "stopped unexpectedly",
  "launch-failed": "could not start",
  "integrity-failure": "failed a code integrity check",
  "memory-eviction": "was unloaded to free memory",
};

export function CrashNotice({ reason, onReload }: { reason: string; onReload: () => void }) {
  return (
    <div className="crash" role="alert">
      <h1>This tab stopped working</h1>
      <p className="lede">The page {WHY[reason] ?? "stopped unexpectedly"}. Your other tabs are not affected.</p>
      <button className="pill on" onClick={onReload}>Reload tab</button>
      <p className="muted">If Ibon captured a crash report, it stays on this device. See Settings → Diagnostics.</p>
    </div>
  );
}
