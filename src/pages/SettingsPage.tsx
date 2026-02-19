import { useState } from "react";
import { Settings, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [deepScan, setDeepScan] = useState(false);
  const [heuristic, setHeuristic] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [autoQuarantine, setAutoQuarantine] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [resultsView, setResultsView] = useState<"table" | "cards">("table");

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-secondary"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-foreground transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground">Configure scan behavior and preferences</p>
        </div>
      </div>

      {/* Scan Options */}
      <div className="cyber-card space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Scan Options</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Deep Scan</p>
            <p className="text-xs text-muted-foreground">Check entire file, not just header</p>
          </div>
          <Toggle checked={deepScan} onChange={setDeepScan} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Heuristic Analysis</p>
            <p className="text-xs text-muted-foreground">Use behavioral analysis for detection</p>
          </div>
          <Toggle checked={heuristic} onChange={setHeuristic} />
        </div>
      </div>

      {/* Alert Settings */}
      <div className="cyber-card space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Alert Settings</h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-foreground">Suspicious Detection Threshold</p>
            <span className="font-mono text-xs text-primary">{threshold}%</span>
          </div>
          <input
            type="range"
            min={70}
            max={95}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>70% (More alerts)</span>
            <span>95% (Fewer alerts)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Auto-Quarantine Suspicious Files</p>
            <p className="text-xs text-muted-foreground">Automatically isolate detected threats</p>
          </div>
          <Toggle checked={autoQuarantine} onChange={setAutoQuarantine} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Get notified when threats are detected</p>
          </div>
          <Toggle checked={emailNotif} onChange={setEmailNotif} />
        </div>
      </div>

      {/* Display */}
      <div className="cyber-card space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Display Preferences</h3>
        <div>
          <p className="text-sm text-foreground mb-2">Results View</p>
          <div className="flex gap-2">
            {(["table", "cards"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setResultsView(v)}
                className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${
                  resultsView === v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Database Update */}
      <div className="cyber-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Signature Database</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current version: v2.4.1</p>
            <p className="text-xs text-muted-foreground">Last updated: 2 hours ago</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" />
            Check for New Signatures
          </button>
        </div>
      </div>
    </div>
  );
}
