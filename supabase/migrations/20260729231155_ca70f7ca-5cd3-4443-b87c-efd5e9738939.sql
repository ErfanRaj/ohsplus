CREATE POLICY "staff read product buckets" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('product-files','product-images') AND public.is_staff(auth.uid()));
CREATE POLICY "staff insert product buckets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('product-files','product-images') AND public.is_staff(auth.uid()));
CREATE POLICY "staff update product buckets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('product-files','product-images') AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id IN ('product-files','product-images') AND public.is_staff(auth.uid()));
CREATE POLICY "staff delete product buckets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('product-files','product-images') AND public.is_staff(auth.uid()));