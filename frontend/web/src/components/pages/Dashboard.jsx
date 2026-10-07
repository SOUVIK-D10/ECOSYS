import React, { useState } from "react";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  GlitchText,
  TerminalInput,
  CircuitLoader,
  HolographicLoader,
  PowerSwitch,
  SecuritySwitch,
  HologramCheckbox,
  GlitchSkeleton,
} from "../else/Storage";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("telemetry");
  const [powerOn, setPowerOn] = useState(true);
  const [shieldActive, setShieldActive] = useState(false);
  const [command, setCommand] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([
    "ECOSYS Kernel v2.4 initialized...",
    "All telemetry nodes responding.",
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [nodeChecks, setNodeChecks] = useState({
    cache: true,
    gateway: true,
    database: false,
  });

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    setTerminalLogs((prev) => [`> ${command}`, `EXECUTING: ${command.toUpperCase()}...`, ...prev]);
    setCommand("");
  };

  const runDiagnostic = () => {
    setIsScanning(true);
    setTerminalLogs((prev) => ["INITIATING DEEP SYSTEM DIAGNOSTIC...", ...prev]);
    setTimeout(() => {
      setIsScanning(false);
      setTerminalLogs((prev) => ["DIAGNOSTIC COMPLETE: 0 critical vulnerabilities found.", ...prev]);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono p-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full border border-slate-800 bg-slate-900/60 p-6 rounded-md backdrop-blur-md shadow-2xl space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <GlitchText text="ECOSYS // CONTROL MATRIX" className="text-2xl text-cyan-400 font-bold" />
            <p className="text-xs text-slate-400">OPERATIONAL TEST RIG // BRIDGE VERIFICATION</p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/80 px-4 py-2 border border-slate-800 rounded">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">CORE POWER</span>
              <PowerSwitch checked={powerOn} onChange={(e) => setPowerOn(e.target.checked)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">SECURITY LOCK</span>
              <SecuritySwitch checked={shieldActive} onChange={(e) => setShieldActive(e.target.checked)} />
            </div>
          </div>
        </div>

        {/* Tab Control Interface */}
        <Tabs defaultValue="telemetry" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1 rounded">
            <TabsTrigger value="telemetry" className="text-xs uppercase">
              Telemetry & Status
            </TabsTrigger>
            <TabsTrigger value="terminal" className="text-xs uppercase">
              Command Console
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs uppercase">
              Diagnostics
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TELEMETRY */}
          <TabsContent value="telemetry" className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loaders & Visuals */}
              <div className="border border-slate-800 bg-slate-950/50 p-4 rounded flex flex-col items-center justify-center gap-4">
                <span className="text-xs text-cyan-400 font-bold">NODE REALTIME FEED</span>
                {powerOn ? (
                  <div className="flex items-center gap-6 py-2">
                    <CircuitLoader />
                    <HolographicLoader />
                  </div>
                ) : (
                  <span className="text-xs text-rose-500 tracking-widest">[SYSTEM OFFLINE]</span>
                )}
              </div>

              {/* Checkboxes / Subsystems */}
              <div className="border border-slate-800 bg-slate-950/50 p-4 rounded flex flex-col gap-3">
                <span className="text-xs text-slate-400 font-bold border-b border-slate-800 pb-1">
                  SUBSYSTEM INTEGRITY
                </span>
                <HologramCheckbox
                  label="Redis Streams Layer"
                  checked={nodeChecks.cache}
                  onChange={(e) => setNodeChecks({ ...nodeChecks, cache: e.target.checked })}
                />
                <HologramCheckbox
                  label="Spring Gateway Router"
                  checked={nodeChecks.gateway}
                  onChange={(e) => setNodeChecks({ ...nodeChecks, gateway: e.target.checked })}
                />
                <HologramCheckbox
                  label="PostgreSQL Spatial Index"
                  checked={nodeChecks.database}
                  onChange={(e) => setNodeChecks({ ...nodeChecks, database: e.target.checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TERMINAL CONSOLE */}
          <TabsContent value="terminal" className="pt-4 space-y-4">
            <form onSubmit={handleCommandSubmit} className="flex gap-2">
              <TerminalInput
                placeholder="Type command (e.g., SYNC, PURGE, STATUS)..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" size="sm" type="submit">
                Execute
              </Button>
            </form>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded h-40 overflow-y-auto space-y-1">
              {terminalLogs.map((log, index) => (
                <div key={index} className="text-xs text-emerald-400">
                  {log}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: DIAGNOSTICS */}
          <TabsContent value="diagnostics" className="pt-4 space-y-4">
            <div className="flex justify-between items-center bg-slate-950/60 p-4 border border-slate-800 rounded">
              <div>
                <h4 className="text-xs font-bold text-slate-200">SYSTEM SCAN ENGINE</h4>
                <p className="text-[10px] text-slate-500">Run full memory integrity audit</p>
              </div>
              <Button
                variant={isScanning ? "danger" : "secondary"}
                size="sm"
                onClick={runDiagnostic}
                disabled={isScanning}
              >
                {isScanning ? "AUDITING..." : "START AUDIT"}
              </Button>
            </div>

            <div className="border border-slate-800 bg-slate-950/40 p-4 rounded">
              {isScanning ? (
                <div className="space-y-3">
                  <GlitchSkeleton />
                  <GlitchSkeleton />
                </div>
              ) : (
                <div className="text-xs text-slate-400 space-y-1">
                  <p>✔ Memory Allocation: 100% Stable</p>
                  <p>✔ Thread Pool: Idle (0 queues blocked)</p>
                  <p>✔ Security Context: JWT Enforcement Active</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}