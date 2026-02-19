import { useState, useCallback } from "react";
import {
  Upload,
  Play,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileText,
  FileImage,
  FileCode,
  HelpCircle,
  Loader2,
} from "lucide-react";

interface ScannedFile {
  name: string;
  extension: string;
  detectedType: string;
  magicBytes: string;
  confidence: number;
  status: "legitimate" | "suspicious" | "unknown";
  headerComparison?: { expected: string; actual: string };
}

const demoFiles: { name: string; desc: string; icon: typeof FileText; result: ScannedFile }[] = [
  {
    name: "normal_image.jpg",
    desc: "Legitimate JPEG",
    icon: FileImage,
    result: {
      name: "normal_image.jpg",
      extension: ".jpg",
      detectedType: "JPEG Image",
      magicBytes: "FF D8 FF E0",
      confidence: 99,
      status: "legitimate",
      headerComparison: { expected: "FF D8 FF E0", actual: "FF D8 FF E0" },
    },
  },
  {
    name: "invoice.pdf.exe",
    desc: "⚠️ Suspicious - Executable disguised as PDF",
    icon: FileCode,
    result: {
      name: "invoice.pdf.exe",
      extension: ".exe",
      detectedType: "PE32 Executable",
      magicBytes: "4D 5A 90 00",
      confidence: 97,
      status: "suspicious",
      headerComparison: { expected: "25 50 44 46 (PDF)", actual: "4D 5A 90 00 (EXE)" },
    },
  },
  {
    name: "document.pdf",
    desc: "Legitimate PDF",
    icon: FileText,
    result: {
      name: "document.pdf",
      extension: ".pdf",
      detectedType: "PDF Document",
      magicBytes: "25 50 44 46",
      confidence: 98,
      status: "legitimate",
      headerComparison: { expected: "25 50 44 46", actual: "25 50 44 46" },
    },
  },
  {
    name: "unknown_file",
    desc: "Missing extension",
    icon: HelpCircle,
    result: {
      name: "unknown_file",
      extension: "N/A",
      detectedType: "Unknown",
      magicBytes: "00 00 00 00",
      confidence: 30,
      status: "unknown",
      headerComparison: { expected: "N/A", actual: "00 00 00 00" },
    },
  },
];

export default function Scanner() {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [uploadedNames, setUploadedNames] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [filter, setFilter] = useState<"all" | "suspicious">("all");
  const [dragOver, setDragOver] = useState(false);

  const addDemoFile = (demo: (typeof demoFiles)[number]) => {
    if (!uploadedNames.includes(demo.name)) {
      setUploadedNames((p) => [...p, demo.name]);
    }
  };

  const handleAnalysis = () => {
    setScanning(true);
    setAnalyzed(false);
    setTimeout(() => {
      const results = uploadedNames.map((name) => {
        const demo = demoFiles.find((d) => d.name === name);
        return demo?.result ?? {
          name,
          extension: name.includes(".") ? "." + name.split(".").pop() : "N/A",
          detectedType: "Unknown",
          magicBytes: "-- -- -- --",
          confidence: 50,
          status: "unknown" as const,
        };
      });
      setFiles(results);
      setScanning(false);
      setAnalyzed(true);
    }, 2000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setUploadedNames((p) => [...p, ...droppedFiles.map((f) => f.name)]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedNames((p) => [...p, ...Array.from(e.target.files!).map((f) => f.name)]);
    }
  };

  const exportCSV = () => {
    const header = "File Name,Extension,Detected Type,Magic Bytes,Confidence,Status\n";
    const rows = files.map((f) =>
      `"${f.name}","${f.extension}","${f.detectedType}","${f.magicBytes}",${f.confidence},"${f.status}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "file_analysis_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayed = filter === "suspicious" ? files.filter((f) => f.status === "suspicious") : files;

  const statusIcon = (s: string) => {
    if (s === "legitimate") return <CheckCircle2 className="h-4 w-4 text-primary" />;
    if (s === "suspicious") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    return <Info className="h-4 w-4 text-accent" />;
  };

  const statusLabel = (s: string) => {
    if (s === "legitimate") return <span className="text-primary">✅ Legitimate</span>;
    if (s === "suspicious") return <span className="text-destructive">⚠️ Suspicious</span>;
    return <span className="text-accent">ℹ️ Unknown</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragOver ? "active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-3 text-sm text-foreground font-medium">
          Drag & Drop files here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Supports multiple file uploads</p>
        {uploadedNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {uploadedNames.map((n) => (
              <span key={n} className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
                {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Demo Files */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Try Demo Files</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {demoFiles.map((d) => {
            const selected = uploadedNames.includes(d.name);
            return (
              <button
                key={d.name}
                onClick={() => addDemoFile(d)}
                className={`cyber-card text-left !p-3 transition-all ${
                  selected ? "!border-primary/60 cyber-glow" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <d.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground">{d.name}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{d.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Analysis */}
      <button
        onClick={handleAnalysis}
        disabled={uploadedNames.length === 0 || scanning}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 cyber-glow"
      >
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {scanning ? "Scanning..." : "Start Analysis"}
      </button>

      {/* Scanning animation */}
      {scanning && (
        <div className="cyber-card relative overflow-hidden">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 rounded-full bg-primary animate-scan-sweep" />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Analyzing file headers and magic bytes...
          </p>
        </div>
      )}

      {/* Results */}
      {analyzed && files.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Files
              </button>
              <button
                onClick={() => setFilter("suspicious")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filter === "suspicious" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Filter className="mr-1 inline h-3 w-3" />
                Suspicious Only
              </button>
            </div>
            <button
              onClick={exportCSV}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3 w-3" />
              Export Report
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Extension</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Detected Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Magic Bytes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((f, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border last:border-0 ${
                      f.status === "suspicious"
                        ? "table-row-suspicious"
                        : f.status === "unknown"
                        ? "table-row-unknown"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-foreground flex items-center gap-2">
                      {statusIcon(f.status)}
                      {f.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.extension}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{f.detectedType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent">{f.magicBytes}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`progress-bar-cyber w-20 ${f.status === "suspicious" ? "progress-bar-danger" : ""}`}>
                          <div className="fill" style={{ width: `${f.confidence}%` }} />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{f.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{statusLabel(f.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Header Comparison */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Binary Header Comparison</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {files
                .filter((f) => f.headerComparison)
                .map((f, i) => (
                  <div
                    key={i}
                    className={
                      f.status === "suspicious" ? "cyber-card-danger" : "cyber-card"
                    }
                  >
                    <p className="font-mono text-xs text-foreground mb-2">{f.name}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-muted-foreground">Expected:</span>
                        <span className="font-mono text-xs text-primary">
                          {f.headerComparison!.expected}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-muted-foreground">Actual:</span>
                        <span
                          className={`font-mono text-xs ${
                            f.headerComparison!.expected === f.headerComparison!.actual
                              ? "text-primary"
                              : "text-destructive"
                          }`}
                        >
                          {f.headerComparison!.actual}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
