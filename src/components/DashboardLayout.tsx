import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ScanSearch,
  Database,
  ShieldAlert,
  BarChart3,
  BookOpen,
  Settings,
  Menu,
  X,
  Shield,
} from "lucide-react";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Scanner", url: "/scanner", icon: ScanSearch },
  { title: "Signatures", url: "/signatures", icon: Database },
  { title: "Detector Demo", url: "/detector", icon: ShieldAlert },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Education", url: "/education", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground glow-text">File Type ID</h1>
            <p className="text-[10px] text-muted-foreground">Content-Based Analysis</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium cyber-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="cyber-card !p-3">
            <p className="text-xs text-muted-foreground">Signature Database</p>
            <p className="font-mono text-sm text-primary">v2.4.1</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Last updated: 2 hours ago</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              File Type ID - Content-Based File Analysis
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Detecting disguised malware by analyzing file signatures, not extensions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">System Active</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
