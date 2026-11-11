import { Component } from "react";

const isChunkError = (error) => {
  const message = String((error && error.message) || error || "");
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("Loading chunk")
  );
};

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(
      "UI error caught by ErrorBoundary:",
      error,
      info && info.componentStack,
    );
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { children, variant = "page" } = this.props;

    if (!error) return children;

    // Renders nothing at all, used for optional widgets like the chatbot
    if (variant === "silent") return null;

    // Small inline card, used for one section of a page
    if (variant === "section") {
      return (
        <div className="card p-5 text-center">
          <p className="text-sm text-surface-600 mb-3">
            This section could not be loaded.
          </p>
          <button onClick={this.reset} className="btn-secondary text-sm px-4">
            Try again
          </button>
        </div>
      );
    }

    // Full page fallback
    const chunkError = isChunkError(error);

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {chunkError ? (
            <>
              <h1 className="text-xl font-bold text-surface-900 mb-2">
                A new version is available
              </h1>
              <p className="text-surface-500 text-sm mb-6">
                nestHaven was updated while this page was open. Reload to
                continue.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary px-8"
              >
                Reload page
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-surface-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-surface-500 text-sm mb-6">
                This page ran into a problem. You can try again or go back to
                the home page.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={this.reset} className="btn-secondary px-6">
                  Try again
                </button>
                <a href="/" className="btn-primary px-6">
                  Go home
                </a>
              </div>
              {import.meta.env.DEV && (
                <pre className="mt-6 text-left text-xs text-red-600 bg-red-50 rounded-xl p-4 overflow-x-auto">
                  {String((error && error.message) || error)}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}
