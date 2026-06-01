import { Link } from "react-router-dom";
import { useAnalysis } from "@/store/analysis-store";
import { topWords, LABELS, type Label } from "@/lib/naive-bayes";
import { useMemo, useRef } from "react";
import { Download, FileBarChart } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HasilPage() {
  const a = useAnalysis();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!a.model || !a.evaluation) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <FileBarChart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-lg font-semibold">Belum ada hasil</h2>
        <p className="mt-1 text-sm text-muted-foreground">Latih model terlebih dahulu di halaman Analisis Sentimen.</p>
        <Link to="/dashboard/analisis" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Ke halaman Analisis
        </Link>
      </div>
    );
  }

  const ev = a.evaluation;

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Laporan Analisis Sentimen — Naive Bayes", 14, 18);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Dataset: ${a.datasetName ?? "-"}`, 14, 26);
    doc.text(`Tanggal: ${new Date(a.trainedAt!).toLocaleString()}`, 14, 31);
    doc.text(`Total sampel: ${a.totalSamples}  |  Train: ${a.trainSize}  Test: ${a.testSize}`, 14, 36);

    doc.setFontSize(12); doc.setTextColor(0); doc.text("Ringkasan Akurasi", 14, 46);
    autoTable(doc, {
      startY: 50,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Accuracy", `${(ev.accuracy * 100).toFixed(2)}%`],
        ["Macro F1-Score", `${(ev.macroF1 * 100).toFixed(2)}%`],
      ],
    });

    doc.text("Per-Class Metrics", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["Label", "Precision", "Recall", "F1-Score", "Support"]],
      body: LABELS.map((l) => [
        l,
        (ev.perClass[l].precision * 100).toFixed(2) + "%",
        (ev.perClass[l].recall * 100).toFixed(2) + "%",
        (ev.perClass[l].f1 * 100).toFixed(2) + "%",
        ev.perClass[l].support.toString(),
      ]),
    });

    doc.text("Confusion Matrix (baris=aktual, kolom=prediksi)", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["", ...LABELS]],
      body: LABELS.map((row) => [row, ...LABELS.map((col) => ev.confusion[row][col].toString())]),
    });

    doc.text("Distribusi Sentimen Dataset", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["Label", "Jumlah", "Persentase"]],
      body: LABELS.map((l) => [
        l,
        a.distribution[l].toString(),
        ((a.distribution[l] / Math.max(a.totalSamples, 1)) * 100).toFixed(2) + "%",
      ]),
    });

    doc.save(`laporan-sentimen-${Date.now()}.pdf`);
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Hasil Evaluasi</h2>
          <p className="text-sm text-muted-foreground">
            Dataset: <span className="font-medium text-foreground">{a.datasetName ?? "-"}</span> · Dilatih{" "}
            {new Date(a.trainedAt!).toLocaleString()}
          </p>
        </div>
        <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Accuracy" value={`${(ev.accuracy * 100).toFixed(2)}%`} highlight />
        <Metric label="Macro Precision" value={`${(avg(LABELS.map((l) => ev.perClass[l].precision)) * 100).toFixed(2)}%`} />
        <Metric label="Macro Recall" value={`${(avg(LABELS.map((l) => ev.perClass[l].recall)) * 100).toFixed(2)}%`} />
        <Metric label="Macro F1-Score" value={`${(ev.macroF1 * 100).toFixed(2)}%`} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-lg font-semibold">Metrik per Kelas</h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">Label</th><th className="px-3 py-2">Precision</th><th className="px-3 py-2">Recall</th><th className="px-3 py-2">F1-Score</th><th className="px-3 py-2">Support</th></tr>
            </thead>
            <tbody>
              {LABELS.map((l) => (
                <tr key={l} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium capitalize">{l}</td>
                  <td className="px-3 py-2.5 font-mono">{(ev.perClass[l].precision * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2.5 font-mono">{(ev.perClass[l].recall * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2.5 font-mono">{(ev.perClass[l].f1 * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2.5 font-mono">{ev.perClass[l].support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-lg font-semibold">Confusion Matrix</h3>
        <p className="mt-1 text-sm text-muted-foreground">Baris = label aktual, kolom = label prediksi.</p>
        <div className="mt-4 overflow-auto">
          <ConfusionMatrix evaluation={ev} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WordCloudCard label="positif" />
        <WordCloudCard label="negatif" />
      </div>
    </div>
  );
}

function avg(arr: number[]) { return arr.reduce((a, b) => a + b, 0) / Math.max(arr.length, 1); }

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function ConfusionMatrix({ evaluation }: { evaluation: ReturnType<typeof useAnalysis>["evaluation"] }) {
  const ev = evaluation!;
  const max = Math.max(...LABELS.flatMap((r) => LABELS.map((c) => ev.confusion[r][c])), 1);
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase text-muted-foreground">
          <th className="px-3 py-2 text-left">Aktual ↓ / Prediksi →</th>
          {LABELS.map((l) => <th key={l} className="px-3 py-2 capitalize">{l}</th>)}
        </tr>
      </thead>
      <tbody>
        {LABELS.map((row) => (
          <tr key={row} className="border-t border-border">
            <td className="px-3 py-2.5 font-medium capitalize">{row}</td>
            {LABELS.map((col) => {
              const v = ev.confusion[row][col];
              const intensity = v / max;
              const correct = row === col;
              return (
                <td key={col} className="px-2 py-2.5">
                  <div
                    className="mx-auto flex h-12 w-full max-w-[120px] items-center justify-center rounded-lg font-mono text-base font-semibold"
                    style={{
                      backgroundColor: correct
                        ? `color-mix(in oklch, var(--positive) ${10 + intensity * 50}%, transparent)`
                        : `color-mix(in oklch, var(--primary) ${5 + intensity * 35}%, transparent)`,
                      color: intensity > 0.5 ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    {v}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WordCloudCard({ label }: { label: Label }) {
  const a = useAnalysis();
  const words = useMemo(() => (a.model ? topWords(a.model, label, 40) : []), [a.model, label]);
  const max = Math.max(...words.map((w) => w.count), 1);
  const color = label === "positif" ? "var(--positive)" : "var(--negative)";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-lg font-semibold">
        Word Cloud — <span className="capitalize" style={{ color }}>{label}</span>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">40 kata paling sering muncul.</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-secondary/40 p-6">
        {words.map((w) => {
          const ratio = w.count / max;
          const size = 12 + ratio * 28;
          return (
            <span
              key={w.word}
              className="font-display font-semibold leading-none"
              style={{ fontSize: `${size}px`, color: `color-mix(in oklch, ${color} ${30 + ratio * 70}%, var(--muted-foreground))` }}
              title={`${w.word}: ${w.count}`}
            >
              {w.word}
            </span>
          );
        })}
        {words.length === 0 && <span className="text-sm text-muted-foreground">Tidak ada data.</span>}
      </div>
    </div>
  );
}
