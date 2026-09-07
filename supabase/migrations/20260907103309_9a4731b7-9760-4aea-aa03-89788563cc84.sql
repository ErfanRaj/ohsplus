ALTER TABLE public.product_files ADD COLUMN IF NOT EXISTS download_url text;
ALTER TABLE public.product_files ALTER COLUMN storage_path DROP NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_files TO authenticated;
GRANT ALL ON public.product_files TO service_role;

DROP POLICY IF EXISTS "product files buyer read" ON public.product_files;
CREATE POLICY "product files buyer read" ON public.product_files
FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = product_files.product_id
      AND o.user_id = auth.uid()
      AND o.status = 'paid'
  )
);