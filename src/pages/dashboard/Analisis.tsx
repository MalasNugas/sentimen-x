import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { evaluate, predict, train, trainTestSplit, type Label } from "@/lib/naive-bayes";
import { analysisStore, useAnalysis } from "@/store/analysis-store";
import { Brain, Play, Sparkles } from "lucide-react";
import { LabelBadge } from "./Dataset";

type Dataset = { id: string; name: string; total_rows: number };

export default function AnalisisPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [predictText, setPredictText] = useState("");
  const [predictResult, setPredictResult] = useState<{ label: Label; scores: Record<Label, number> } | null>(null);
  const analysis = useAnalysis();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("datasets").select("id,name,total_rows").order("created_at", { ascending: false });
      setDatasets((data as Dataset[]) ?? []);
      if (data && data.length) setSelected(data[0].id);
    })();
  }, []);

  async function handleTrain() {
    if (!selected) return;
    setTraining(true);
    setProgress("Memuat dataset...");
    try {
      const all: { tweet: string; label: Label }[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("tweets")
          .select("tweet,label")
          .eq("dataset_id", selected)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...(data as any));
        if (data.length < pageSize) break;
        from += pageSize;
        setProgress(`Memuat ${all.length} baris...`);
      }
      if (all.length < 5) throw new Error("Dataset terlalu kecil untuk dilatih.");

      setProgress("Train-test split 80:20...");
      const { train: tr, test: te } = trainTestSplit(all, 0.2, 42);

      setProgress(`Melatih Naive Bayes pada ${tr.length} baris...`);
      await new Promise((r) => setTimeout(r, 50));
      const model = train(tr);

      setProgress(`Mengevaluasi pada ${te.length} baris...`);
      await new Promise((r) => setTimeout(r, 50));
      const evaluation = evaluate(model, te);

      const dist: Record<Label, number> = { positif: 0, netral: 0, negatif: 0 };
      for (const s of all) dist[s.label]++;
      const ds = datasets.find((d) => d.id === selected);

      analysisStore.set({
        model, evaluation,
        trainedAt: new Date().toISOString(),
        trainSize: tr.length, testSize: te.length,
        datasetName: ds?.name ?? null,
        totalSamples: all.length,
        distribution: dist,
      });
      setProgress(`Selesai. Akurasi: ${(evaluation.accuracy * 100).toFixed(2)}%`);
    } catch (e: any) {
      setProgress(`Error: ${e.message ?? e}`);
    } finally {
      setTraining(false);
    }
  }

  function handlePredict() {
    if (!analysis.model || !predictText.trim()) return;
    setPredictResult(predict(analysis.model, predictText));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Training Multinomial Naive Bayes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Train-test split 80:20, Laplace smoothing α = 1.</p>
          </div>
          <Brain className="h-6 w-6 text-primary" />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={training}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {datasets.length === 0 && <option value="">Belum ada dataset — upload dulu</option>}
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.total_rows})</option>
            ))}
          </select>
          <button
            onClick={handleTrain}
            disabled={training || !selected}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {training ? "Melatih..." : "Mulai Training"}
          </button>
        </div>

        {progress && <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm">{progress}</div>}

        {analysis.model && (
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Stat label="Total Sampel" value={analysis.totalSamples.toString()} />
            <Stat label="Train" value={analysis.trainSize.toString()} />
            <Stat label="Test" value={analysis.testSize.toString()} />
            <Stat label="Akurasi" value={analysis.evaluation ? `${(analysis.evaluation.accuracy * 100).toFixed(2)}%` : "—"} highlight />
          </div>
        )}

        {analysis.model && (
          <div className="mt-4 text-sm text-muted-foreground">
            Lihat metrik lengkap di{" "}
            <Link to="/dashboard/hasil" className="font-medium text-primary hover:underline">Hasil Akurasi →</Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Prediksi Tweet Baru</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Coba klasifikasikan teks bebas dengan model yang telah dilatih.</p>
        <textarea
          value={predictText}
          onChange={(e) => setPredictText(e.target.value)}
          rows={3}
          placeholder={analysis.model ? "Tulis tweet di sini..." : "Latih model terlebih dahulu."}
          disabled={!analysis.model}
          className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handlePredict}
            disabled={!analysis.model || !predictText.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            Prediksi
          </button>
          {predictResult && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Hasil:</span>
              <LabelBadge label={predictResult.label} />
            </div>
          )}
        </div>
        {predictResult && (
          <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
            {(["positif", "netral", "negatif"] as Label[]).map((l) => (
              <div key={l} className="rounded-lg border border-border bg-background px-3 py-2">
                <div className="capitalize text-muted-foreground">{l}</div>
                <div className="font-mono">{predictResult.scores[l].toFixed(3)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
