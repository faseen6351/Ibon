import { useEffect, useRef, useState } from "react";

import type { FindResult } from "../lib/api";

interface Props {
  /** null while a search is under way and nothing has come back yet. */
  result: FindResult | null;
  /** Bumped each time the shortcut is pressed, so pressing it again refocuses the box. */
  focusKey: number;
  onQuery: (text: string) => void;
  onStep: (text: string, forward: boolean) => void;
  onClose: () => void;
}

/** Ctrl/Cmd+F. Sits between the toolbar and the page so the native page view never covers it. */
export function FindBar({ result, focusKey, onQuery, onStep, onClose }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, [focusKey]);

  const status = text === "" || result === null ? "" : result.matches === 0 ? "No matches" : `${result.active} of ${result.matches}`;
  const none = result === null || result.matches === 0;

  return (
    <div className="findbar" role="search">
      <input
        ref={input}
        className="find-input"
        value={text}
        placeholder="Find in page"
        spellCheck={false}
        aria-label="Find in page"
        onChange={(e) => {
          setText(e.target.value);
          onQuery(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          else if (e.key === "Enter") {
            e.preventDefault();
            onStep(text, !e.shiftKey);
          }
        }}
      />
      <span className="find-status muted" aria-live="polite">{status}</span>
      <button className="icon" onClick={() => onStep(text, false)} disabled={none} title="Previous match (Shift+Enter)" aria-label="Previous match">↑</button>
      <button className="icon" onClick={() => onStep(text, true)} disabled={none} title="Next match (Enter)" aria-label="Next match">↓</button>
      <button className="icon" onClick={onClose} title="Close (Esc)" aria-label="Close find">×</button>
    </div>
  );
}
