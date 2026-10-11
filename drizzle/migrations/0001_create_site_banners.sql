CREATE TABLE public.site_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text,
  badge_text text,
  cta_label text,
  image_url text,
  link_url text NOT NULL DEFAULT '',
  is_external boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  placement text NOT NULL DEFAULT 'home_mid',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_banners TO authenticated;
GRANT ALL ON public.site_banners TO service_role;
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active banners" ON public.site_banners FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage banners" ON public.site_banners FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_site_banners_updated BEFORE UPDATE ON public.site_banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();