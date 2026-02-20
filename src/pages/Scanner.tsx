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
  Music,
  FileArchive,
  File,
  FileType,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Signature Database ───────────────────────────────────────────
const KNOWN_SIGNATURES: { magic: number[]; type: string; display: string; category: string }[] = [
  { magic: [0xFF, 0xD8, 0xFF], type: "JPEG Image", display: "FF D8 FF", category: "image" },
  { magic: [0x89, 0x50, 0x4E, 0x47], type: "PNG Image", display: "89 50 4E 47", category: "image" },
  { magic: [0x47, 0x49, 0x46, 0x38], type: "GIF Image", display: "47 49 46 38", category: "image" },
  { magic: [0x25, 0x50, 0x44, 0x46], type: "PDF Document", display: "25 50 44 46", category: "document" },
  { magic: [0x50, 0x4B, 0x03, 0x04], type: "ZIP/Office Archive", display: "50 4B 03 04", category: "archive" },
  { magic: [0x4D, 0x5A], type: "PE32 Executable", display: "4D 5A", category: "executable" },
  { magic: [0x7F, 0x45, 0x4C, 0x46], type: "ELF Executable", display: "7F 45 4C 46", category: "executable" },
  { magic: [0x52, 0x61, 0x72, 0x21], type: "RAR Archive", display: "52 61 72 21", category: "archive" },
  { magic: [0x1F, 0x8B], type: "GZIP Archive", display: "1F 8B", category: "archive" },
  { magic: [0x42, 0x4D], type: "BMP Image", display: "42 4D", category: "image" },
  { magic: [0x49, 0x44, 0x33], type: "MP3 Audio (ID3)", display: "49 44 33", category: "audio" },
  { magic: [0xFF, 0xFB], type: "MP3 Audio", display: "FF FB", category: "audio" },
  { magic: [0xFF, 0xF3], type: "MP3 Audio", display: "FF F3", category: "audio" },
  { magic: [0xFF, 0xF2], type: "MP3 Audio", display: "FF F2", category: "audio" },
  { magic: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], type: "MP4 Video", display: "00 00 00 18 66 74 79 70", category: "video" },
  { magic: [0x52, 0x49, 0x46, 0x46], type: "RIFF (WAV/AVI)", display: "52 49 46 46", category: "audio" },
  { magic: [0x4F, 0x67, 0x67, 0x53], type: "OGG Media", display: "4F 67 67 53", category: "audio" },
  { magic: [0x66, 0x4C, 0x61, 0x43], type: "FLAC Audio", display: "66 4C 61 43", category: "audio" },
  { magic: [0x37, 0x7A, 0xBC, 0xAF], type: "7-Zip Archive", display: "37 7A BC AF", category: "archive" },
  { magic: [0xCA, 0xFE, 0xBA, 0xBE], type: "Java Class", display: "CA FE BA BE", category: "executable" },
  { magic: [0x23, 0x21], type: "Shell Script", display: "23 21", category: "executable" },
  { magic: [0xD0, 0xCF, 0x11, 0xE0], type: "MS Office (Legacy)", display: "D0 CF 11 E0", category: "document" },
];

// ─── Helpers ──────────────────────────────────────────────────────
function readMagicBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(0, 32));
  });
}

function identifyFile(bytes: Uint8Array): { type: string; display: string; category: string } | null {
  for (const sig of KNOWN_SIGNATURES) {
    if (sig.magic.every((b, i) => bytes[i] === b)) {
      return { type: sig.type, display: sig.display, category: sig.category };
    }
  }
  return null;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}

function getExpectedType(ext: string): string | null {
  const map: Record<string, string> = {
    jpg: "FF D8 FF", jpeg: "FF D8 FF", png: "89 50 4E 47", gif: "47 49 46 38",
    pdf: "25 50 44 46", zip: "50 4B 03 04", exe: "4D 5A", bmp: "42 4D",
    mp3: "49 44 33", rar: "52 61 72 21", gz: "1F 8B", "7z": "37 7A BC AF",
    doc: "D0 CF 11 E0", docx: "50 4B 03 04", xlsx: "50 4B 03 04", pptx: "50 4B 03 04",
  };
  return map[ext.toLowerCase()] ?? null;
}

/** Refine ZIP-based detection for DOCX/XLSX/PPTX by checking file extension */
function refineZipType(ext: string, baseType: string): string {
  if (baseType !== "ZIP/Office Archive") return baseType;
  const officeMap: Record<string, string> = {
    docx: "DOCX Document", xlsx: "XLSX Spreadsheet", pptx: "PPTX Presentation",
  };
  return officeMap[ext.toLowerCase()] ?? baseType;
}

function getFileTypeIcon(category: string, status: string) {
  const iconClass = status === "suspicious" ? "text-destructive" : status === "unknown" ? "text-accent" : "text-primary";
  switch (category) {
    case "image": return <FileImage className={`h-5 w-5 ${iconClass}`} />;
    case "document": return <FileText className={`h-5 w-5 ${iconClass}`} />;
    case "audio": return <Music className={`h-5 w-5 ${iconClass}`} />;
    case "archive": return <FileArchive className={`h-5 w-5 ${iconClass}`} />;
    case "executable": return <FileCode className={`h-5 w-5 ${iconClass}`} />;
    default: return <File className={`h-5 w-5 ${iconClass}`} />;
  }
}

// ─── Types ────────────────────────────────────────────────────────
interface ScannedFile {
  name: string;
  extension: string;
  detectedType: string;
  magicBytes: string;
  confidence: number;
  status: "legitimate" | "suspicious" | "unknown";
  category: string;
  headerComparison?: { expected: string; actual: string };
  rawBytes?: number[];
}

const demoFiles: { name: string; desc: string; icon: typeof FileText; result: ScannedFile }[] = [
  {
    name: "normal_image.jpg", desc: "Legitimate JPEG", icon: FileImage,
    result: { name: "normal_image.jpg", extension: ".jpg", detectedType: "JPEG Image", magicBytes: "FF D8 FF E0", confidence: 99, status: "legitimate", category: "image", headerComparison: { expected: "FF D8 FF", actual: "FF D8 FF" } },
  },
  {
    name: "invoice.pdf.exe", desc: "⚠️ Executable disguised as PDF", icon: FileCode,
    result: { name: "invoice.pdf.exe", extension: ".exe", detectedType: "PE32 Executable", magicBytes: "4D 5A 90 00", confidence: 97, status: "suspicious", category: "executable", headerComparison: { expected: "25 50 44 46 (PDF)", actual: "4D 5A 90 00 (EXE)" } },
  },
  {
    name: "report.docx", desc: "Legitimate DOCX", icon: FileText,
    result: { name: "report.docx", extension: ".docx", detectedType: "DOCX Document", magicBytes: "50 4B 03 04", confidence: 98, status: "legitimate", category: "document", headerComparison: { expected: "50 4B 03 04", actual: "50 4B 03 04" } },
  },
  {
    name: "song.mp3", desc: "MP3 Audio File", icon: Music,
    result: { name: "song.mp3", extension: ".mp3", detectedType: "MP3 Audio (ID3)", magicBytes: "49 44 33 04", confidence: 98, status: "legitimate", category: "audio", headerComparison: { expected: "49 44 33", actual: "49 44 33" } },
  },
  {
    name: "document.pdf", desc: "Legitimate PDF", icon: FileText,
    result: { name: "document.pdf", extension: ".pdf", detectedType: "PDF Document", magicBytes: "25 50 44 46", confidence: 98, status: "legitimate", category: "document", headerComparison: { expected: "25 50 44 46", actual: "25 50 44 46" } },
  },
  {
    name: "unknown_file", desc: "Missing extension", icon: HelpCircle,
    result: { name: "unknown_file", extension: "N/A", detectedType: "Unknown", magicBytes: "00 00 00 00", confidence: 30, status: "unknown", category: "unknown", headerComparison: { expected: "N/A", actual: "00 00 00 00" } },
  },
];

// ─── Component ────────────────────────────────────────────────────
export default function Scanner() {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [uploadedNames, setUploadedNames] = useState<string[]>([]);
  const [realFiles, setRealFiles] = useState<Map<string, File>>(new Map());
  const [scanning, setScanning] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [filter, setFilter] = useState<"all" | "suspicious">("all");
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const addDemoFile = (demo: (typeof demoFiles)[number]) => {
    if (!uploadedNames.includes(demo.name)) {
      setUploadedNames((p) => [...p, demo.name]);
    }
  };

  const addRealFiles = (fileList: File[]) => {
    const newMap = new Map(realFiles);
    const newNames: string[] = [];
    fileList.forEach((f) => {
      if (!uploadedNames.includes(f.name) && !newNames.includes(f.name)) {
        newMap.set(f.name, f);
        newNames.push(f.name);
      }
    });
    setRealFiles(newMap);
    setUploadedNames((p) => [...p, ...newNames]);
  };

  const removeFile = (name: string) => {
    setUploadedNames((p) => p.filter((n) => n !== name));
    setRealFiles((prev) => { const m = new Map(prev); m.delete(name); return m; });
  };

  const analyzeRealFile = async (file: File): Promise<ScannedFile> => {
    const bytes = await readMagicBytes(file);
    const hex = bytesToHex(bytes);
    const match = identifyFile(bytes);
    const ext = file.name.includes(".") ? file.name.split(".").pop()! : "";
    const expectedHex = getExpectedType(ext);

    let detectedType = match?.type ?? "Unknown";
    detectedType = refineZipType(ext, detectedType);
    const category = match?.category ?? "unknown";

    const mismatch = expectedHex != null && match != null && !expectedHex.startsWith(match.display.slice(0, expectedHex.length));
    const status: ScannedFile["status"] = match
      ? mismatch ? "suspicious" : "legitimate"
      : "unknown";

    return {
      name: file.name, extension: ext ? `.${ext}` : "N/A", detectedType,
      magicBytes: hex.slice(0, 23), confidence: match ? (mismatch ? 95 : 98) : 30,
      status, category,
      rawBytes: Array.from(bytes.slice(0, 16)),
      headerComparison: {
        expected: expectedHex ? `${expectedHex} (${ext.toUpperCase()})` : "N/A",
        actual: match ? `${match.display} (${detectedType})` : hex.slice(0, 11),
      },
    };
  };

  const handleAnalysis = async () => {
    if (uploadedNames.length === 0) return;
    setScanning(true);
    setAnalyzed(false);

    const results: ScannedFile[] = [];
    for (const name of uploadedNames) {
      const realFile = realFiles.get(name);
      if (realFile) {
        results.push(await analyzeRealFile(realFile));
      } else {
        const demo = demoFiles.find((d) => d.name === name);
        results.push(demo?.result ?? {
          name, extension: name.includes(".") ? "." + name.split(".").pop() : "N/A",
          detectedType: "Unknown", magicBytes: "-- -- -- --", confidence: 50,
          status: "unknown" as const, category: "unknown",
        });
      }
    }

    await new Promise((r) => setTimeout(r, 1200));
    setFiles(results);
    setScanning(false);
    setAnalyzed(true);

    // Alert for suspicious / unknown
    const suspicious = results.filter((f) => f.status === "suspicious");
    const unknown = results.filter((f) => f.status === "unknown");

    if (suspicious.length > 0) {
      toast({
        variant: "destructive",
        title: `⚠️ ${suspicious.length} Suspicious File${suspicious.length > 1 ? "s" : ""} Detected`,
        description: suspicious.map((f) => f.name).join(", "),
      });
    }
    if (unknown.length > 0) {
      toast({
        title: `ℹ️ ${unknown.length} Unknown File${unknown.length > 1 ? "s" : ""}`,
        description: "Could not identify: " + unknown.map((f) => f.name).join(", "),
      });
    }
    if (suspicious.length === 0 && unknown.length === 0) {
      toast({ title: "✅ All files look legitimate", description: `${results.length} file(s) scanned successfully.` });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addRealFiles(Array.from(e.dataTransfer.files));
  }, [realFiles, uploadedNames]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addRealFiles(Array.from(e.target.files));
  };

  const exportCSV = () => {
    const header = "File Name,Extension,Detected Type,Magic Bytes,Confidence,Status\n";
    const rows = files.map((f) =>
      `"${f.name}","${f.extension}","${f.detectedType}","${f.magicBytes}",${f.confidence},"${f.status}"`
    ).join("\n");
    downloadBlob(header + rows, "file_analysis_report.csv", "text/csv");
  };

  const exportText = () => {
    const lines = files.map((f) =>
      `${f.name} | ${f.extension} | ${f.detectedType} | ${f.magicBytes} | ${f.confidence}% | ${f.status.toUpperCase()}`
    );
    const content = `File Type Analysis Report\n${"=".repeat(60)}\n\n` +
      `File Name | Extension | Detected Type | Magic Bytes | Confidence | Status\n` +
      `${"-".repeat(80)}\n` + lines.join("\n");
    downloadBlob(content, "file_analysis_report.txt", "text/plain");
  };

  const downloadBlob = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const displayed = filter === "suspicious" ? files.filter((f) => f.status === "suspicious") : files;

  const statusLabel = (s: string) => {
    if (s === "legitimate") return <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"><CheckCircle2 className="h-3 w-3" /> Legitimate</span>;
    if (s === "suspicious") return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive"><AlertTriangle className="h-3 w-3" /> Suspicious</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"><Info className="h-3 w-3" /> Unknown</span>;
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
        <input id="file-input" type="file" multiple className="hidden" onChange={handleFileInput} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-3 text-sm text-foreground font-medium">Drag & Drop files here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG, PDF, DOCX, MP3, EXE, ZIP and more</p>
        {uploadedNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
            {uploadedNames.map((n) => (
              <span key={n} className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground">
                {n}
                <button onClick={() => removeFile(n)} className="rounded-full hover:bg-muted p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Demo Files */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Try Demo Files</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {demoFiles.map((d) => {
            const selected = uploadedNames.includes(d.name);
            return (
              <button key={d.name} onClick={() => addDemoFile(d)}
                className={`cyber-card text-left !p-3 transition-all ${selected ? "!border-primary/60 cyber-glow" : ""}`}>
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
      <button onClick={handleAnalysis} disabled={uploadedNames.length === 0 || scanning}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 cyber-glow">
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {scanning ? "Scanning..." : "Start Analysis"}
      </button>

      {/* Scanning animation */}
      {scanning && (
        <div className="cyber-card relative overflow-hidden">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 rounded-full bg-primary animate-scan-sweep" />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Analyzing file headers and magic bytes…</p>
        </div>
      )}

      {/* Results */}
      {analyzed && files.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <button onClick={() => setFilter("all")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                All Files
              </button>
              <button onClick={() => setFilter("suspicious")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === "suspicious" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Filter className="mr-1 inline h-3 w-3" />Suspicious Only
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Download className="h-3 w-3" />CSV
              </button>
              <button onClick={exportText}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <FileType className="h-3 w-3" />TXT
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Extension</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Detected Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Magic Bytes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((f, i) => (
                  <tr key={i}
                    className={`border-b border-border last:border-0 ${f.status === "suspicious" ? "table-row-suspicious" : f.status === "unknown" ? "table-row-unknown" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        {getFileTypeIcon(f.category, f.status)}
                        <span>{f.name}</span>
                      </div>
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

          {/* Hex Viewer */}
          {files.some((f) => f.rawBytes && f.rawBytes.length > 0) && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Hex Viewer — First 16 Bytes</h3>
              <div className="space-y-3">
                {files.filter((f) => f.rawBytes && f.rawBytes.length > 0).map((f, i) => (
                  <div key={i} className={f.status === "suspicious" ? "cyber-card-danger" : "cyber-card"}>
                    <div className="flex items-center gap-2 mb-3">
                      {getFileTypeIcon(f.category, f.status)}
                      <p className="font-mono text-xs text-foreground font-semibold">{f.name}</p>
                      {statusLabel(f.status)}
                    </div>
                    <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                      {/* Offset + Hex */}
                      <div className="font-mono text-xs space-y-1">
                        <span className="text-muted-foreground">Offset</span>
                        <div className="text-muted-foreground">00</div>
                        {f.rawBytes!.length > 8 && <div className="text-muted-foreground">08</div>}
                      </div>
                      <div className="font-mono text-xs space-y-1">
                        <span className="text-muted-foreground">Hex</span>
                        <div className="flex gap-1 flex-wrap">
                          {f.rawBytes!.slice(0, 8).map((b, j) => (
                            <span key={j} className={`px-1 py-0.5 rounded ${j < 4 ? "bg-primary/20 text-primary" : "text-foreground"}`}>
                              {b.toString(16).toUpperCase().padStart(2, "0")}
                            </span>
                          ))}
                        </div>
                        {f.rawBytes!.length > 8 && (
                          <div className="flex gap-1 flex-wrap">
                            {f.rawBytes!.slice(8, 16).map((b, j) => (
                              <span key={j} className="px-1 py-0.5 text-foreground">{b.toString(16).toUpperCase().padStart(2, "0")}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* ASCII */}
                      <div className="font-mono text-xs space-y-1">
                        <span className="text-muted-foreground">ASCII</span>
                        <div className="text-accent">
                          {f.rawBytes!.slice(0, 8).map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("")}
                        </div>
                        {f.rawBytes!.length > 8 && (
                          <div className="text-accent">
                            {f.rawBytes!.slice(8, 16).map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Header Comparison */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Binary Header Comparison</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {files.filter((f) => f.headerComparison).map((f, i) => (
                <div key={i} className={f.status === "suspicious" ? "cyber-card-danger" : "cyber-card"}>
                  <div className="flex items-center gap-2 mb-2">
                    {getFileTypeIcon(f.category, f.status)}
                    <p className="font-mono text-xs text-foreground">{f.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[11px] text-muted-foreground">Expected:</span>
                      <span className="font-mono text-xs text-primary">{f.headerComparison!.expected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] text-muted-foreground">Actual:</span>
                      <span className={`font-mono text-xs ${f.headerComparison!.expected === f.headerComparison!.actual ? "text-primary" : "text-destructive"}`}>
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
