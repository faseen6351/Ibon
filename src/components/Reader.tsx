import type { PageText } from "../lib/api";

interface Props {
  state: { page?: PageText; error?: string; loading: boolean };
  blocked: number;
  onRefresh: () => void;
}

export function Reader({ state, blocked, onRefresh }: Props) {
  const { page, error, loading } = state;
  return (
    <div className="reader">
      <div className="reader-inner">
        {loading && <p className="muted">Reading page…</p>}
        {error && <p className="error">{error}</p>}
        {page && !loading && (
          <>
            <h1>{page.title}</h1>
            <p className="muted">
              {page.words.toLocaleString()} words · {Math.round(page.bytes / 1024)} KB of HTML · {blocked} requests blocked ·{" "}
              <button className="link" onClick={onRefresh}>refresh</button>
            </p>
            {page.description && <p className="lede">{page.description}</p>}
            <div className="reader-text">{page.text || "No readable text found on this page."}</div>
          </>
        )}
      </div>
    </div>
  );
}
