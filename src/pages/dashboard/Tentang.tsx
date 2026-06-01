import { Brain, Calculator, Sparkles } from "lucide-react";

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Brain className="h-5 w-5" /></div>
          <h2 className="font-display text-2xl font-bold">Apa itu Analisis Sentimen?</h2>
        </div>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Analisis sentimen</strong> adalah proses menentukan opini atau emosi dari sebuah teks —
          biasanya diklasifikasikan ke kategori <em>positif</em>, <em>netral</em>, atau <em>negatif</em>.
          Pada media sosial seperti X (Twitter), analisis sentimen digunakan untuk memahami reaksi publik
          terhadap suatu isu, produk, atau kebijakan.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Calculator className="h-5 w-5" /></div>
          <h2 className="font-display text-2xl font-bold">Multinomial Naive Bayes</h2>
        </div>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Naive Bayes adalah algoritma klasifikasi probabilistik berdasarkan <strong className="text-foreground">Teorema Bayes</strong>{" "}
          dengan asumsi <em>"naive"</em> bahwa setiap fitur (kata) saling independen. Varian{" "}
          <strong className="text-foreground">Multinomial</strong> sangat cocok untuk klasifikasi teks karena
          mempertimbangkan frekuensi kemunculan kata.
        </p>

        <div className="mt-6 rounded-xl bg-secondary/50 p-6 font-mono text-sm">
          <div className="text-muted-foreground">Teorema Bayes:</div>
          <div className="mt-2 text-base"><strong>P(c | d)</strong> ∝ P(c) × ∏ P(w<sub>i</sub> | c)</div>
          <div className="mt-3 text-muted-foreground">Dengan Laplace smoothing (α = 1):</div>
          <div className="mt-1 text-base">P(w | c) = (count(w, c) + α) / (Σ count(w', c) + α·|V|)</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Preprocessing", d: "Lowercase, hapus URL/mention, tokenisasi, stopword removal." },
            { n: "2", t: "Training", d: "Hitung prior P(c) dan likelihood P(w|c) per kelas dari data latih." },
            { n: "3", t: "Prediksi", d: "Pilih kelas dengan log-probability tertinggi: argmax P(c|d)." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-background p-4">
              <div className="font-display text-2xl font-bold text-primary">{s.n}</div>
              <div className="mt-1 font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
          <h2 className="font-display text-2xl font-bold">Mengapa Naive Bayes?</h2>
        </div>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>✓ <strong className="text-foreground">Cepat & efisien</strong>, cocok untuk dataset besar.</li>
          <li>✓ <strong className="text-foreground">Mudah diimplementasikan</strong> dan diinterpretasi.</li>
          <li>✓ Bekerja sangat baik untuk <strong className="text-foreground">klasifikasi teks</strong> seperti spam filter dan sentimen.</li>
          <li>✓ Memerlukan <strong className="text-foreground">data latih lebih sedikit</strong> dibanding model kompleks.</li>
        </ul>
      </div>
    </div>
  );
}
