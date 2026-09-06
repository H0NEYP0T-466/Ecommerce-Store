import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "40px auto", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2 style={{ fontSize: "24px", color: "#e11d48", marginBottom: "12px" }}>Something went wrong</h2>
          <p style={{ color: "#4b5563", marginBottom: "20px" }}>
            {this.state.error?.message || "An unexpected error occurred while loading this view."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{ padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "999px", cursor: "pointer", fontWeight: 600 }}
            >
              Reload Page
            </button>
            <a
              href="/"
              style={{ padding: "10px 20px", background: "#f3f4f6", color: "#111", textDecoration: "none", borderRadius: "999px", fontWeight: 600 }}
            >
              Go to Homepage
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
