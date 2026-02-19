import { useState } from "react";
import { ShieldAlert, Eye, Binary, ArrowRight, Loader2 } from "lucide-react";

const scenarios = [
  {
    tab: "Family Photo",
    userSees: { name: "family_photo.jpg", type: "JPEG Image", icon: "🖼️" },
    reality: {
      type: "PE32 Executable (MZ header)",
      hex: "4D 5A 90 00 03 00 00 00",
      danger: true,
    },
  },
  {
    tab: "Invoice.pdf.exe",
    userSees: { name: "Invoice.pdf.exe", type: "PDF Document", icon: "📄" },
    reality: {
      type: "PE32 Executable masquerading as PDF",
      hex: "4D 5A 90 00 03 00 00 00",
      danger: true,
    },
  },
  {
    tab: "Resume.doc",
    userSees: { name: "Resume.doc", type: "Word Document", icon: "📝" },
    reality: {
      type: "ZIP file with embedded macros",
      hex: "50 4B 03 04 14 00 06 00",
      danger: true,
    },
  },
  {
    tab: "No extension",
    userSees: { name: "mystery_file", type: "Unknown", icon: "❓" },
    reality: {
      type: "PNG Image identified by header",
      hex: "89 50 4E 47 0D 0A 1A 0A",
      danger: false,
    },
  },
];

export default function DetectorDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const scenario = scenarios[activeTab];

  const triggerScan = () => {
    setScanning(true);
    setRevealed(false);
    setTimeout(() => {
      setScanning(false);
      setRevealed(true);
    }, 2000);
  };

  const switchTab = (i: number) => {
    setActiveTab(i);
    setRevealed(false);
    setScanning(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Suspicious File Detector Demo</h2>
        <p className="text-xs text-muted-foreground">See how magic bytes reveal the truth about disguised files</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => switchTab(i)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === i
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.tab}
          </button>
        ))}
      </div>

      {/* Side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left */}
        <div className="cyber-card">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">What the user sees</h3>
          </div>
          <div className="flex flex-col items-center gap-3 py-6 rounded-lg bg-secondary/30">
            <span className="text-5xl">{scenario.userSees.icon}</span>
            <p className="font-mono text-sm text-foreground">{scenario.userSees.name}</p>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {scenario.userSees.type}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className={scenario.reality.danger ? "cyber-card-danger" : "cyber-card"}>
          <div className="flex items-center gap-2 mb-3">
            <Binary className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">What's really inside</h3>
          </div>
          <div className="flex flex-col items-center gap-3 py-6 rounded-lg bg-secondary/30">
            {scanning ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Analyzing magic bytes...</p>
                <div className="w-full max-w-xs h-1 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary animate-scan-sweep w-1/2 rounded-full" />
                </div>
              </>
            ) : revealed ? (
              <>
                {scenario.reality.danger ? (
                  <ShieldAlert className="h-10 w-10 text-destructive" />
                ) : (
                  <span className="text-5xl">✅</span>
                )}
                <p className="text-sm font-medium text-foreground">{scenario.reality.type}</p>
                <div className="rounded-md bg-background/50 px-4 py-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Hex dump:</p>
                  <p className="font-mono text-sm text-accent tracking-wider">
                    {scenario.reality.hex}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="text-4xl opacity-30">🔍</span>
                <p className="text-xs text-muted-foreground">Click "Scan" to reveal</p>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={triggerScan}
        disabled={scanning}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 cyber-glow"
      >
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {scanning ? "Scanning..." : "Scan File"}
      </button>
    </div>
  );
}
