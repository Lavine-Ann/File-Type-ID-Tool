import { useState } from "react";
import { Search, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Signature {
  type: string;
  magicHex: string;
  ascii: string;
  offset: string;
  example: string;
}

const signatures: Signature[] = [
  { type: "JPEG", magicHex: "FF D8 FF E0", ascii: "ÿØÿà", offset: "0", example: "Digital photos, web images" },
  { type: "PNG", magicHex: "89 50 4E 47", ascii: "‰PNG", offset: "0", example: "Lossless images, screenshots" },
  { type: "GIF", magicHex: "47 49 46 38", ascii: "GIF8", offset: "0", example: "Animated images" },
  { type: "PDF", magicHex: "25 50 44 46", ascii: "%PDF", offset: "0", example: "Documents, forms" },
  { type: "EXE/DLL", magicHex: "4D 5A", ascii: "MZ", offset: "0", example: "Windows executables" },
  { type: "ZIP", magicHex: "50 4B 03 04", ascii: "PK..", offset: "0", example: "Compressed archives" },
  { type: "RAR", magicHex: "52 61 72 21", ascii: "Rar!", offset: "0", example: "RAR archives" },
  { type: "7z", magicHex: "37 7A BC AF", ascii: "7z¼¯", offset: "0", example: "7-Zip archives" },
  { type: "ELF", magicHex: "7F 45 4C 46", ascii: ".ELF", offset: "0", example: "Linux executables" },
  { type: "MP3", magicHex: "49 44 33", ascii: "ID3", offset: "0", example: "Audio files" },
  { type: "MP4", magicHex: "66 74 79 70", ascii: "ftyp", offset: "4", example: "Video files" },
  { type: "WAV", magicHex: "52 49 46 46", ascii: "RIFF", offset: "0", example: "Audio files" },
  { type: "BMP", magicHex: "42 4D", ascii: "BM", offset: "0", example: "Bitmap images" },
  { type: "DOCX", magicHex: "50 4B 03 04", ascii: "PK..", offset: "0", example: "Word documents (ZIP-based)" },
  { type: "SQLite", magicHex: "53 51 4C 69", ascii: "SQLi", offset: "0", example: "SQLite databases" },
  { type: "Mach-O", magicHex: "CF FA ED FE", ascii: "Ïúíþ", offset: "0", example: "macOS executables" },
  { type: "TIFF", magicHex: "49 49 2A 00", ascii: "II*.", offset: "0", example: "High-quality images" },
  { type: "WebP", magicHex: "52 49 46 46", ascii: "RIFF", offset: "0", example: "Modern web images" },
  { type: "class", magicHex: "CA FE BA BE", ascii: "Êþº¾", offset: "0", example: "Java class files" },
  { type: "FLAC", magicHex: "66 4C 61 43", ascii: "fLaC", offset: "0", example: "Lossless audio" },
];

const interactiveExample = {
  hex: ["89", "50", "4E", "47", "0D", "0A", "1A", "0A", "00", "00", "00", "0D", "49", "48", "44", "52"],
  ascii: ["‰", "P", "N", "G", "\\r", "\\n", ".", "\\n", ".", ".", ".", "\\r", "I", "H", "D", "R"],
  labels: [
    "Magic byte 1", "Magic byte 2", "Magic byte 3", "Magic byte 4",
    "Line ending", "Line ending", "EOF", "Line ending",
    "Chunk length", "Chunk length", "Chunk length", "Chunk length",
    "Chunk type", "Chunk type", "Chunk type", "Chunk type",
  ],
};

export default function Signatures() {
  const [search, setSearch] = useState("");
  const [hoveredByte, setHoveredByte] = useState<number | null>(null);

  const filtered = signatures.filter(
    (s) =>
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.magicHex.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">File Signatures Database</h2>
        <p className="text-xs text-muted-foreground">Common file type signatures (magic bytes)</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by file type or hex..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Signatures Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">File Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Magic Bytes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ASCII</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Offset</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Example Use</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <tr className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-help transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{s.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent">{s.magicHex}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.ascii}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.offset}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.example}</td>
                  </tr>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    <strong>{s.type}</strong> files start with bytes <code className="font-mono text-accent">{s.magicHex}</code> at offset {s.offset}. Used for: {s.example}.
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Example */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-accent" />
          How Magic Bytes Work — Interactive PNG Header
        </h3>
        <div className="cyber-card">
          <p className="text-xs text-muted-foreground mb-4">
            Hover over each byte to learn its purpose in a PNG file header.
          </p>
          {/* Hex row */}
          <div className="flex flex-wrap gap-1 mb-2">
            {interactiveExample.hex.map((h, i) => (
              <span
                key={i}
                onMouseEnter={() => setHoveredByte(i)}
                onMouseLeave={() => setHoveredByte(null)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded font-mono text-xs cursor-pointer transition-all ${
                  hoveredByte === i
                    ? "bg-primary text-primary-foreground scale-110"
                    : i < 4
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {h}
              </span>
            ))}
          </div>
          {/* ASCII row */}
          <div className="flex flex-wrap gap-1 mb-3">
            {interactiveExample.ascii.map((a, i) => (
              <span
                key={i}
                className={`inline-flex h-8 w-8 items-center justify-center rounded font-mono text-[10px] transition-all ${
                  hoveredByte === i ? "bg-accent/20 text-accent" : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {a}
              </span>
            ))}
          </div>
          {hoveredByte !== null && (
            <div className="rounded-md bg-secondary p-2 text-xs text-foreground animate-fade-in">
              <span className="text-accent font-mono">{interactiveExample.hex[hoveredByte]}</span>
              {" — "}
              {interactiveExample.labels[hoveredByte]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
