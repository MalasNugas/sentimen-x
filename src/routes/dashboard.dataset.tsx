import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2, Upload } from "lucide-react";
import type { Label } from "@/lib/naive-bayes";

export const Route = createFileRoute("/dashboard/dataset")({
  component: DatasetPage,
});

type Dataset = { id: string; name: string; total_rows: number; created_at: string };
type Tweet = { id: string; tweet: string; label: Label; dataset_id: string };

function normalizeLabel(v: unknown): Label | null {
  const s = String(v ?? "").toLowerCase().trim();
  if (["positif", "positive", "pos", "1"].includes(s)) return "positif";
  if (["netral", "neutral", "neu", "0"].includes(s)) return "netral";
  if (["negatif", "negative", "neg", "-1"].includes(s)) return "negatif";
  return null;
}

function DatasetPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [keyword, setKeyword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function loadDatasets() {
    const { data } = await supabase.from("datasets").select("*").order("created_at", { ascending: false });
    setDatasets(data ?? []);
    if (data && data.length && !activeId) setActiveId(data[0].id);
  }
  async function loadTweets(id: string) {
    const { data } = await supabase.from("tweets").select("*").eq("dataset_id", id).limit(1000);
    setTweets((data as Tweet[]) ?? []);
  }
  useEffect(() => { loadDatasets(); }, []);
  useEffect(() => { if (activeId) loadTweets(activeId); }, [activeId]);

  const filtered = useMemo(
    () => (keyword ? tweets.filter((t) => t.tweet.toLowerCase().includes(keyword.toLowerCase())) : tweets),
    [tweets, keyword]
  );

  async function handleFile(file: File) {
    setUploading(true);
    setStatus("Membaca file...");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const parsed: { tweet: string; label: Label }[] = [];
      for (const r of rows) {
        const tweet = String(r.tweet ?? r.Tweet ?? r.text ?? r.Text ?? "").trim();
        const label = normalizeLabel(r.label ?? r.Label ?? r.sentimen ?? r.Sentimen);
        if (tweet && label) parsed.push({ tweet, label });
      }
      if (parsed.length === 0) throw new Error("Tidak ada baris valid (kolom 'tweet' & 'label' dengan nilai positif/netral/negatif).");

      setStatus(`Mengunggah ${parsed.length} baris...`);
      const { data: ds, error } = await supabase
        .from("datasets")
        .insert({ name: file.name, total_rows: parsed.length })
        .select()
        .single();
      if (error || !ds) throw error ?? new Error("Gagal membuat dataset");

      const chunkSize = 500;
      for (let i = 0; i < parsed.length; i += chunkSize) {
        const chunk = parsed.slice(i, i + chunkSize).map((p) => ({ ...p, dataset_id: ds.id }));
        const { error: e } = await supabase.from("tweets").insert(chunk);
        if (e) throw e;
        setStatus(`Mengunggah ${Math.min(i + chunkSize, parsed.length)}/${parsed.length}...`);
      }
      setStatus(`Berhasil mengunggah ${parsed.length} tweet.`);
      await loadDatasets();
      setActiveId(ds.id);
    } catch (e: any) {
      setStatus(`Error: ${e.message ?? e}`);
    } finally {
      setUploading(false);
    }
  }

  async function deleteDataset(id: string) {
    if (!confirm("Hapus dataset ini?")) return;
    await supabase.from("datasets").delete().eq("id", id);
    setActiveId(null);
    setTweets([]);
    loadDatasets();
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-semibold">Upload Dataset</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Format <code className="rounded bg-muted px-1 py-0.5 text-xs">.xlsx</code> dengan kolom{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">tweet</code> dan{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">label</code> (positif / netral / negatif).
        </p>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 transition hover:border-primary hover:bg-secondary/60">
          <Upload className="h-6 w-6 text-primary" />
          <div className="text-sm font-medium">{uploading ? "Mengunggah..." : "Klik untuk pilih file XLSX"}</div>
          <input type="file" accept=".xlsx,.xls" hidden disabled={uploading} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
        {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
      </div>

      {/* Datasets list */}
      {datasets.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold">Dataset Tersimpan</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {datasets.map((d) => (
              <div
                key={d.id}
                className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  activeId === d.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent"
                }`}
              >
                <button onClick={() => setActiveId(d.id)} className="font-medium">{d.name}</button>
                <span className="text-xs text-muted-foreground">{d.total_rows}</span>
                <button onClick={() => deleteDataset(d.id)} className="opacity-0 transition group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {tweets.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Preview ({filtered.length} dari {tweets.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari tweet..."
                className="rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-4 max-h-[500px] overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Tweet</th>
                  <th className="px-4 py-2.5">Label</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 500).map((t, i) => (
                  <tr key={t.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2">{t.tweet}</td>
                    <td className="px-4 py-2"><LabelBadge label={t.label} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 500 && <p className="mt-2 text-xs text-muted-foreground">Menampilkan 500 baris pertama.</p>}
        </div>
      )}
    </div>
  );
}

export function LabelBadge({ label }: { label: Label }) {
  const map: Record<Label, { bg: string; fg: string }> = {
    positif: { bg: "color-mix(in oklch, var(--positive) 18%, transparent)", fg: "var(--positive)" },
    netral:  { bg: "color-mix(in oklch, var(--neutral) 22%, transparent)",  fg: "var(--foreground)" },
    negatif: { bg: "color-mix(in oklch, var(--negative) 18%, transparent)", fg: "var(--negative)" },
  };
  const c = map[label];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: c.bg, color: c.fg }}>
      {label}
    </span>
  );
}
