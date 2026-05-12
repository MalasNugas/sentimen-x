import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Brain, Sparkles, Upload } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Analisis Sentimen X — Naive Bayes" },
      { name: "description", content: "Aplikasi analisis sentimen masyarakat di media sosial X menggunakan algoritma Multinomial Naive Bayes." },
      { property: "og:title", content: "Analisis Sentimen X — Naive Bayes" },
      { property: "og:description", content: "Klasifikasi tweet positif, netral, dan negatif secara real-time." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-semibold">SentimenX</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#fitur" className="hover:text-foreground">Fitur</a>
            <a href="#alur" className="hover:text-foreground">Alur Kerja</a>
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Mulai Analisis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 [background:var(--gradient-soft)]" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 text-center md:pt-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Skripsi · Multinomial Naive Bayes
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Analisis Sentimen Masyarakat<br />
            di Media Sosial <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>X</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Klasifikasikan opini publik menjadi <strong className="text-foreground">positif</strong>,{" "}
            <strong className="text-foreground">netral</strong>, dan{" "}
            <strong className="text-foreground">negatif</strong> menggunakan algoritma Multinomial Naive Bayes —
            lengkap dengan evaluasi akurasi, confusion matrix, dan word cloud.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:opacity-95"
            >
              Mulai Analisis <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#fitur" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-medium text-foreground hover:bg-accent">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Fitur Lengkap untuk Skripsi</h2>
          <p className="mt-3 text-muted-foreground">Pipeline klasik machine learning dalam UI modern dan mudah dipahami.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, title: "Upload Dataset XLSX", desc: "Unggah dataset tweet beserta label, preview tabel, dan pencarian keyword." },
            { icon: Brain, title: "Training Naive Bayes", desc: "Multinomial Naive Bayes dengan train-test split 80:20 secara real-time di browser." },
            { icon: BarChart3, title: "Evaluasi Lengkap", desc: "Accuracy, Precision, Recall, F1-Score, Confusion Matrix, dan Word Cloud." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alur kerja */}
      <section id="alur" className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Alur Kerja</h2>
            <p className="mt-3 text-muted-foreground">Empat langkah dari dataset mentah hingga laporan PDF.</p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {["Upload Dataset","Training Model","Evaluasi","Export PDF"].map((s, i) => (
              <li key={s} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-display text-3xl font-bold text-primary">0{i+1}</div>
                <div className="mt-2 font-semibold">{s}</div>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-elegant)]">
              Mulai Analisis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SentimenX · Skripsi Analisis Sentimen Naive Bayes
      </footer>
    </div>
  );
}
