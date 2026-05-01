import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    console.error("NEXUS ErrorBoundary", err, info);
  }

  render(): ReactNode {
    if (this.state.err) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border border-nexus-danger/40 bg-nexus-danger/10 p-3 text-sm text-nexus-danger">
          <div className="flex items-center gap-2 font-mono font-semibold">
            <AlertTriangle className="h-4 w-4" />
            {this.props.label ?? "Component error"}
          </div>
          <p className="text-nexus-text/80">{this.state.err.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
