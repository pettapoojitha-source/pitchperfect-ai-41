-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Decks
CREATE TABLE public.decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  startup_name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  deck_data JSONB NOT NULL,
  original_deck_data JSONB,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  issues_fixed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX decks_user_id_idx ON public.decks(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decks TO authenticated;
GRANT ALL ON public.decks TO service_role;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decks_select_own" ON public.decks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "decks_insert_own" ON public.decks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_update_own" ON public.decks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_delete_own" ON public.decks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Critiques
CREATE TABLE public.critiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  critic_persona TEXT NOT NULL DEFAULT 'Seed VC',
  critic_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX critiques_deck_id_idx ON public.critiques(deck_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.critiques TO authenticated;
GRANT ALL ON public.critiques TO service_role;
ALTER TABLE public.critiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "critiques_select_own" ON public.critiques FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "critiques_insert_own" ON public.critiques FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "critiques_update_own" ON public.critiques FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "critiques_delete_own" ON public.critiques FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Slide edits (audit of manual edits)
CREATE TABLE public.slide_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  slide_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX slide_edits_deck_id_idx ON public.slide_edits(deck_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.slide_edits TO authenticated;
GRANT ALL ON public.slide_edits TO service_role;
ALTER TABLE public.slide_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slide_edits_select_own" ON public.slide_edits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "slide_edits_insert_own" ON public.slide_edits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "slide_edits_update_own" ON public.slide_edits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "slide_edits_delete_own" ON public.slide_edits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER decks_set_updated_at BEFORE UPDATE ON public.decks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();