import { Component, type ErrorInfo, type ReactNode } from "react";

// Without this, one uncaught error while rendering unmounts the whole UI and leaves a blank window.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ibon] UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash" role="alert">
        <h1>Ibon's interface hit an error</h1>
        <p className="lede">Your tabs are still open. Reload the interface to carry on.</p>
        <button className="pill on" onClick={() => location.reload()}>Reload interface</button>
        <p className="muted">{this.state.error.message}</p>
      </div>
    );
  }
}
