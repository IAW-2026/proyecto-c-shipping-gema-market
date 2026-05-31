"use client";

import { TrafficLog } from "./_components/traffic-log";
import { usePlaygroundState } from "./_components/use-playground-state";
import { ConfigPanel } from "./_components/config-panel";
import { EndpointGroups } from "./_components/endpoint-groups";
import { FlowStatusCard } from "./_components/flow-status-card";

export default function ApiPlaygroundPage() {
    const state = usePlaygroundState();

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold text-ink">API Playground</h1>
                    <span className="text-[10px] bg-bone text-ink-3 px-2 py-0.5 rounded-full font-semibold">dev</span>
                </div>
                <p className="text-sm text-ink-2 mb-5">
                    Simula el flujo completo de integracion entre aplicaciones del ecosistema UniHousing.
                </p>

                <ConfigPanel
                    config={state.config}
                    configOpen={state.configOpen}
                    setConfigOpen={state.setConfigOpen}
                    updateConfig={state.updateConfig}
                />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
                    <div className="space-y-4">
                        <EndpointGroups epGroups={state.epGroups} states={state.states} onSend={state.handleSend} />
                        <FlowStatusCard flow={state.flow} onReset={state.resetAll} />
                    </div>
                    <TrafficLog entries={state.logEntries} onClear={state.clearLog} />
                </div>
            </div>
        </div>
    );
}
