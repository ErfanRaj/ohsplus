DROP POLICY IF EXISTS "Public reads active banners" ON public.site_banners;
CREATE POLICY "Anyone reads active banners" ON public.site_banners FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Staff read all banners" ON public.site_banners FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
GRANT SELECT ON public.site_banners TO anon;