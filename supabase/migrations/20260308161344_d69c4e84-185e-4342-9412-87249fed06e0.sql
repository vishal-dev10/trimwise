
CREATE TABLE public.shortlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, variant_id)
);

ALTER TABLE public.shortlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own shortlist"
  ON public.shortlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shortlist"
  ON public.shortlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shortlist"
  ON public.shortlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
