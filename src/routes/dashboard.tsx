import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { BarChart3, Brain, Database, FileBarChart, GraduationCap, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SentimenX" },
      { name: "description", content: "Dashboard analisis sentimen Naive Bayes." },
    ],
  }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/dataset", label: "Dataset", icon: Database },
  { to: "/dashboard/analisis", label: "Analisis Sentimen", icon: Brain },
  { to: "/dashboard/hasil", label: "Hasil Akurasi", icon: BarChart3 },
  { to: "/dashboard/tentang", label: "Tentang Naive Bayes", icon: GraduationCap },
] as const;

function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const isActive = (to: string, exact?: boolean) => (exact ? path === to : path === to || path.startsWith(to + "/"));

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <Link to="/" className="font-display text-lg font-semibold text-sidebar-foreground">SentimenX</Link>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => {
            const active = isActive(n.to, (n as any).exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-xs text-sidebar-foreground/80">
          <div className="flex items-center gap-2 font-medium text-sidebar-foreground">
            <FileBarChart className="h-4 w-4 text-primary" /> Skripsi 2025
          </div>
          <p className="mt-1.5 leading-relaxed">Multinomial Naive Bayes · Train/Test 80:20</p>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setOpen(false)} />}

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 text-foreground hover:bg-accent md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-semibold text-foreground md:text-lg">
            {NAV.find((n) => isActive(n.to, (n as any).exact))?.label ?? "Dashboard"}
          </h1>
          <div className="text-xs text-muted-foreground">Naive Bayes · X Sentiment</div>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
