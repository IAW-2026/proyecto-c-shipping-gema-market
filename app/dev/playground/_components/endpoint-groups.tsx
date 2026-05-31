import { CompactAppCard } from "./compact-app-card";
import { CompactEndpointItem } from "./compact-endpoint-item";
import { APP_META } from "./constants";
import type { EndpointDef, RequestState } from "./types";

export function EndpointGroups({
    epGroups,
    states,
    onSend,
}: {
    epGroups: Record<string, EndpointDef[]>;
    states: Record<string, RequestState>;
    onSend: (ep: EndpointDef) => void;
}) {
    return (
        <>
            {Object.entries(epGroups).map(([appKey, endpoints]) => {
                const meta = APP_META[appKey];
                const step = endpoints[0]?.step ?? 1;
                return (
                    <CompactAppCard key={appKey} step={step} meta={meta}>
                        {endpoints.map((ep) => (
                            <CompactEndpointItem
                                key={ep.id}
                                ep={ep}
                                state={states[ep.id]}
                                onSend={() => onSend(ep)}
                            />
                        ))}
                    </CompactAppCard>
                );
            })}
        </>
    );
}
