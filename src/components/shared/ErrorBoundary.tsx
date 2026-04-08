import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);

    // 🔥 Send to logging service (Sentry, LogRocket etc.)
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
            <>
            
          <div className="min-h-[100vh] flex items-center justify-center px-4 bg-white">

            <div className="max-w-md w-full text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-red-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold tracking-tight">
                Something went wrong
              </h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                We hit an unexpected issue. You can try again, or return to the
                homepage if the problem persists.
              </p>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
                >
                  Try again
                </button>

                <a
                  href="/"
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition"
                >
                  Go home
                </a>
              </div>

              {/* Optional subtle help */}
              <p className="text-xs text-muted-foreground">
                If this keeps happening, please contact support.
              </p>
            </div>
          </div></>
        )
      );
    }
    return this.props.children;
  }
}
