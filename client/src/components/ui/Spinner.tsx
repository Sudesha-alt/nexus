import { Loader2 } from "lucide-react";

export function Spinner({ className = "" }: { className?: string }): React.ReactElement {
  return (
    <Loader2 className={`h-5 w-5 animate-spin text-nexus-cyan ${className}`} aria-hidden />
  );
}
