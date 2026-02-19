import { useState } from "react";
import { BarChart3, Download, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const lineData = [
  { date: "Jan", suspicious: 3 },
  { date: "Feb", suspicious: 5 },
  { date: "Mar", suspicious: 2 },
  { date: "Apr", suspicious: 8 },
  { date: "May", suspicious: 6 },
  { date: "Jun", suspicious: 12 },
  { date: "Jul", suspicious: 7 },
  { date: "Aug", suspicious: 18 },
];

const pieData = [
  { name: "PDF", value: 35 },
  { name: "JPEG", value: 28 },
  { name: "EXE", value: 15 },
  { name: "ZIP", value: 12 },
  { name: "Other", value: 10 },
];

const PIE_COLORS = [
  "hsl(160, 100%, 45%)",
  "hsl(195, 100%, 50%)",
  "hsl(0, 72%, 55%)",
  "hsl(38, 92%, 55%)",
  "hsl(220, 15%, 40%)",
];

const recentScans = [
  { file: "report_q4.pdf", type: "PDF", status: "legitimate", date: "2026-02-19" },
  { file: "setup.exe", type: "EXE", status: "suspicious", date: "2026-02-18" },
  { file: "photo.jpg.exe", type: "EXE", status: "suspicious", date: "2026-02-18" },
  { file: "data.csv", type: "CSV", status: "legitimate", date: "2026-02-17" },
  { file: "archive.zip", type: "ZIP", status: "legitimate", date: "2026-02-17" },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("last30");

  const exportData = (format: string) => {
    const content =
      format === "csv"
        ? "File,Type,Status,Date\n" + recentScans.map((s) => `${s.file},${s.type},${s.status},${s.date}`).join("\n")
        : format === "json"
        ? JSON.stringify(recentScans, null, 2)
        : "Report generated";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Reports Dashboard</h2>
          <p className="text-xs text-muted-foreground">Scan analytics and threat intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground"
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Scans", value: "124" },
          { label: "Detection Rate", value: "14.5%" },
          { label: "Common Type", value: "PDF" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold font-mono text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cyber-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Suspicious Files Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 15%, 18%)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(210, 20%, 90%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="suspicious"
                stroke="hsl(0, 72%, 55%)"
                strokeWidth={2}
                dot={{ fill: "hsl(0, 72%, 55%)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cyber-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">File Types Scanned</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 15%, 18%)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(210, 20%, 90%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-[10px] text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Scans</h3>
          <div className="flex gap-1">
            {["csv", "json"].map((f) => (
              <button
                key={f}
                onClick={() => exportData(f)}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground uppercase transition-colors"
              >
                <Download className="h-3 w-3" />
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">File</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((s, i) => (
                <tr key={i} className={`border-b border-border last:border-0 ${s.status === "suspicious" ? "table-row-suspicious" : ""}`}>
                  <td className="px-3 py-2 font-mono text-xs text-foreground">{s.file}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{s.type}</td>
                  <td className="px-3 py-2 text-xs">
                    {s.status === "suspicious" ? (
                      <span className="text-destructive">⚠️ Suspicious</span>
                    ) : (
                      <span className="text-primary">✅ Legitimate</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report */}
      <button
        onClick={() => exportData("csv")}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 cyber-glow"
      >
        <BarChart3 className="h-4 w-4" />
        Generate Detailed Report
      </button>
    </div>
  );
}
