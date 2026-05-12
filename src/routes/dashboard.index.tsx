import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalysis } from "@/store/analysis-store";
import { ArrowRight, Brain, Database as DbIcon, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const COLORS: Record<string, string> = {
  positif: "var(--positive)",
  netral: "var(--neutral)",
  negatif: "var(--negative)",
};

function DashboardHome() {
  const analysis = useAnalysis();
  const [totalDb, setTotalDb] = useState<number | null>(null);
  const [dist, setDist] = useState<{ positif: number; netral: number; negatif: number }>({ positif: 0, netral: 0, negatif: 0 });
  const [datasetCount, setDatasetCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { count } = await supabase.from("tweets").select("*", { count: "exact", head: true });
      setTotalDb(count ?? 0);
      const { count: dc } = await supabase.from("datasets").select("*", { count: "exact", head: true });
      setDatasetCount(dc ?? 0);
      const next = { positif: 0, netral: 0, negatif: 0 };
      for (const l of ["positif", "netral", "negatif"] as const) {
        const { count: c } = await supabase.from("tweets").select("*", { count: "exact", head: true }).eq("label", l);
        next[l] = c ?? 0;
      }
      setDist(next);
    })();
  }, [analysis.trainedAt]);

  const total = (totalDb ?? 0) || 1;
  const data = [
    { name: "Positif", value: dist.positif, key: "positif" },
    { name: "Netral", value: dist.netral, key: "netral" },
    { name: "Negatif", value: dist.negatif, key: "negatif" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Dataset" value={datasetCount.toString()} icon={DbIcon} hint="Dataset terupload" />
        <StatCard label="Total Tweet" value={(totalDb ?? 0).toLocaleString()} icon={TrendingUp} hint="Baris di database" />
        <StatCard label="Status Model" value={analysis.model ? "Trained" : "—"} icon={Brain} hint={analysis.trainedAt ? new Date(analysis.trainedAt).toLocaleString() : "Belum dilatih"} />
        <StatCard label="Akurasi" value={analysis.evaluation ? `${(analysis.evaluation.accuracy * 100).toFixed(1)}%` : "—"} icon={TrendingUp} hint="Pada data uji 20%" />
      </div>

      {/* Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Distribusi Sentimen</h2>
          <p className="mt-1 text-sm text-muted-foreground">Persentase label dari seluruh dataset.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(["positif", "netral", "negatif"] as const).map((l) => {
              const pct = (dist[l] / total) * 100;
              return (
                <div key={l} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{l}</span>
                    <span className="font-mono font-semibold">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: `var(--${l === "positif" ? "positive" : l === "netral" ? "neutral" : "negative"})` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{dist[l].toLocaleString()} tweet</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold">Komposisi</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {data.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard to="/dashboard/dataset" title="Kelola Dataset" desc="Upload XLSX dan jelajahi data." />
        <ActionCard to="/dashboard/analisis" title="Latih Model" desc="Training Naive Bayes 80:20." />
        <ActionCard to="/dashboard/hasil" title="Lihat Hasil" desc="Akurasi, confusion matrix, word cloud." />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: any; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function ActionCard({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}
