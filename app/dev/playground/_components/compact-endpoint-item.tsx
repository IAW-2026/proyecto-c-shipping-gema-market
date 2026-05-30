import type { EndpointDef, RequestState } from "./types";

export function CompactEndpointItem({
    ep,
    state,
    onSend,
}: {
    ep: EndpointDef;
    state?: RequestState;
    onSend: () => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onSend}
                disabled={state === "loading"}
                className="flex-1 bg-clay text-paper hover:bg-cocoa rounded-full h-9 px-4 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left truncate"
            >
                {state === "loading" ? "Enviando..." : ep.label}
            </button>
            {state === "success" && <span className="text-success text-xs font-semibold shrink-0">OK</span>}
            {state === "error" && <span className="text-danger text-xs font-semibold shrink-0">Error</span>}
        </div>
    );
}
