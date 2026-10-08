CREATE POLICY "buyers read purchased product files" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'product-files' AND EXISTS (
    SELECT 1 FROM public.product_files pf
    JOIN public.order_items oi ON oi.product_id = pf.product_id
    JOIN public.orders o ON o.id = oi.order_id
    WHERE pf.storage_path = storage.objects.name AND pf.deleted_at IS NULL
      AND o.user_id = auth.uid() AND o.status = 'paid'
  )
);