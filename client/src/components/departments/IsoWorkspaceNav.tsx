import { useNavigate } from "react-router-dom";

export type IsoNavActive = "floor" | "command" | "history" | "integrations" | "none";

export function IsoWorkspaceNav({
  active,
  suiteHint,
}: {
  active: IsoNavActive;
  /** When set (suite zoom page), shows “you are here” chip */
  suiteHint?: string;
}) {
  const navigate = useNavigate();

  return (
    <header className="iso-nav">
      <div className="flex flex-wrap items-center gap-3">
        <div className="iso-nav-brand">NEXUS</div>
        {suiteHint ? (
          <span className="rounded-full border border-sky-400/50 bg-sky-500/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-sky-200">
            {suiteHint}
          </span>
        ) : null}
      </div>
      <nav className="iso-nav-links" aria-label="Workspace navigation">
        <button
          type="button"
          data-active={active === "command" ? "true" : "false"}
          onClick={() => navigate("/")}
        >
          Command
        </button>
        <button
          type="button"
          data-active={active === "floor" ? "true" : "false"}
          onClick={() => navigate("/departments")}
        >
          Floor map
        </button>
        <button
          type="button"
          data-active={active === "history" ? "true" : "false"}
          onClick={() => navigate("/history")}
        >
          History
        </button>
        <button
          type="button"
          data-active={active === "integrations" ? "true" : "false"}
          onClick={() => navigate("/integrations")}
        >
          Integrations
        </button>
      </nav>
    </header>
  );
}
