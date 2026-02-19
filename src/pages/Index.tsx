import { Link } from "react-router-dom";
import { ScanSearch, Database, ShieldAlert, BarChart3, BookOpen, Shield, ArrowRight, FileWarning, FileCheck, Activity } from "lucide-react";

const stats = [
  { label: "Files Scanned", value: "124", icon: FileCheck, color: "text-primary" },
  { label: "Suspicious Files", value: "18", icon: FileWarning, color: "text-warning" },
  { label: "Threats Blocked", value: "7", icon: Shield, color: "text-destructive" },
];

const quickLinks = [
  { title: "Scanner", desc: "Upload & analyze files", url: "/scanner", icon: ScanSearch },
  { title: "Signatures DB", desc: "Browse file signatures", url: "/signatures", icon: Database },
  { title: "Detector Demo", desc: "See live detection", url: "/detector", icon: ShieldAlert },
  { title: "Reports", desc: "View scan history", url: "/reports", icon: BarChart3 },
  { title: "Education", desc: "Learn about magic bytes", url: "/education", icon: BookOpen },
];

export default function Index() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`mt-1 text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.color} opacity-40`} />
            </div>
          </div>
        ))}
      </div>

      {/* Activity indicator */}
      <div className="cyber-card flex items-center gap-3">
        <Activity className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm text-foreground">System Status: <span className="text-primary font-medium">All systems operational</span></p>
          <p className="text-xs text-muted-foreground">Signature database up to date • Last scan: 12 minutes ago</p>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Access</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((l) => (
            <Link
              key={l.url}
              to={l.url}
              className="cyber-card group flex items-center gap-3 !p-4 hover:border-primary/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <l.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
