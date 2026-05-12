// Multinomial Naive Bayes implementation for sentiment analysis
// Labels: 'positif' | 'netral' | 'negatif'

export type Label = "positif" | "netral" | "negatif";
export const LABELS: Label[] = ["positif", "netral", "negatif"];

const STOPWORDS = new Set([
  "yang","di","ke","dari","dan","atau","ini","itu","dengan","untuk","pada","adalah","ada",
  "saya","kamu","aku","kita","mereka","dia","nya","sih","aja","saja","juga","tidak","gak",
  "ga","tak","akan","sudah","belum","lagi","mau","jadi","kalau","kalo","yg","dg","dr","ya",
  "the","a","an","is","are","of","to","in","on","for","and","or","this","that","it","i","you"
]);

export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/@\w+/g, " ")
    .replace(/#/g, " ")
    .replace(/[^a-zA-Z\u00C0-\u017F\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export interface NBModel {
  vocab: string[];
  vocabIndex: Record<string, number>;
  classCounts: Record<Label, number>;
  classWordTotals: Record<Label, number>;
  wordCounts: Record<Label, Record<string, number>>;
  totalDocs: number;
  alpha: number;
}

export function train(samples: { tweet: string; label: Label }[], alpha = 1): NBModel {
  const vocab: string[] = [];
  const vocabIndex: Record<string, number> = {};
  const classCounts: Record<Label, number> = { positif: 0, netral: 0, negatif: 0 };
  const classWordTotals: Record<Label, number> = { positif: 0, netral: 0, negatif: 0 };
  const wordCounts: Record<Label, Record<string, number>> = { positif: {}, netral: {}, negatif: {} };

  for (const s of samples) {
    const label = s.label;
    if (!classCounts[label] && classCounts[label] !== 0) continue;
    classCounts[label]++;
    const tokens = tokenize(s.tweet);
    for (const t of tokens) {
      if (!(t in vocabIndex)) {
        vocabIndex[t] = vocab.length;
        vocab.push(t);
      }
      wordCounts[label][t] = (wordCounts[label][t] || 0) + 1;
      classWordTotals[label]++;
    }
  }

  return {
    vocab, vocabIndex, classCounts, classWordTotals, wordCounts,
    totalDocs: samples.length, alpha,
  };
}

export function predict(model: NBModel, text: string): { label: Label; scores: Record<Label, number> } {
  const tokens = tokenize(text);
  const V = model.vocab.length;
  const scores: Record<Label, number> = { positif: -Infinity, netral: -Infinity, negatif: -Infinity };

  for (const label of LABELS) {
    if (model.classCounts[label] === 0) continue;
    let logProb = Math.log(model.classCounts[label] / Math.max(model.totalDocs, 1));
    const denom = model.classWordTotals[label] + model.alpha * V;
    for (const t of tokens) {
      const c = model.wordCounts[label][t] || 0;
      logProb += Math.log((c + model.alpha) / denom);
    }
    scores[label] = logProb;
  }

  let best: Label = "netral";
  let bestScore = -Infinity;
  for (const l of LABELS) {
    if (scores[l] > bestScore) { bestScore = scores[l]; best = l; }
  }
  return { label: best, scores };
}

export interface EvalResult {
  accuracy: number;
  perClass: Record<Label, { precision: number; recall: number; f1: number; support: number }>;
  macroF1: number;
  confusion: Record<Label, Record<Label, number>>;
}

export function evaluate(model: NBModel, testSet: { tweet: string; label: Label }[]): EvalResult {
  const confusion: Record<Label, Record<Label, number>> = {
    positif: { positif: 0, netral: 0, negatif: 0 },
    netral:  { positif: 0, netral: 0, negatif: 0 },
    negatif: { positif: 0, netral: 0, negatif: 0 },
  };
  let correct = 0;
  for (const s of testSet) {
    const { label } = predict(model, s.tweet);
    confusion[s.label][label]++;
    if (label === s.label) correct++;
  }
  const perClass = {} as EvalResult["perClass"];
  for (const l of LABELS) {
    const tp = confusion[l][l];
    let fp = 0, fn = 0;
    for (const o of LABELS) {
      if (o !== l) { fp += confusion[o][l]; fn += confusion[l][o]; }
    }
    const support = tp + fn;
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = support === 0 ? 0 : tp / support;
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    perClass[l] = { precision, recall, f1, support };
  }
  const macroF1 = (perClass.positif.f1 + perClass.netral.f1 + perClass.negatif.f1) / 3;
  return { accuracy: testSet.length === 0 ? 0 : correct / testSet.length, perClass, macroF1, confusion };
}

export function trainTestSplit<T>(arr: T[], testRatio = 0.2, seed = 42): { train: T[]; test: T[] } {
  // seeded shuffle (mulberry32)
  let s = seed >>> 0;
  const rand = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const cut = Math.max(1, Math.floor(a.length * (1 - testRatio)));
  return { train: a.slice(0, cut), test: a.slice(cut) };
}

export function topWords(model: NBModel, label: Label, n = 40): { word: string; count: number }[] {
  return Object.entries(model.wordCounts[label])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({ word, count }));
}
