
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  tweet TEXT NOT NULL,
  label TEXT NOT NULL CHECK (label IN ('positif','netral','negatif')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tweets_dataset ON public.tweets(dataset_id);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

-- Public access for thesis demo (no auth required)
CREATE POLICY "public read datasets" ON public.datasets FOR SELECT USING (true);
CREATE POLICY "public insert datasets" ON public.datasets FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete datasets" ON public.datasets FOR DELETE USING (true);

CREATE POLICY "public read tweets" ON public.tweets FOR SELECT USING (true);
CREATE POLICY "public insert tweets" ON public.tweets FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete tweets" ON public.tweets FOR DELETE USING (true);
