-- ============ CATEGORIES: image icon ============
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_url text;

-- ============ ARTICLES: rich content ============
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content_html text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS key_takeaways jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============ CART ITEMS ============
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 99),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.cart_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_cart_items_updated BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ORDERS ============
CREATE TYPE public.order_status AS ENUM ('pending_payment','paid','cancelled','failed');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  terms_accepted boolean NOT NULL DEFAULT false,
  subtotal_toman integer NOT NULL DEFAULT 0,
  total_toman integer NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_provider text,
  payment_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND terms_accepted = true
    AND status = 'pending_payment'
    AND length(btrim(full_name)) BETWEEN 2 AND 120
    AND length(btrim(phone)) BETWEEN 8 AND 20
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
CREATE POLICY "orders guest insert" ON public.orders FOR INSERT TO anon
  WITH CHECK (
    user_id IS NULL
    AND terms_accepted = true
    AND status = 'pending_payment'
    AND length(btrim(full_name)) BETWEEN 2 AND 120
    AND length(btrim(phone)) BETWEEN 8 AND 20
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
CREATE POLICY "orders staff update" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  title text NOT NULL,
  unit_price_toman integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 99),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
                 AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order items guest insert" ON public.order_items FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id IS NULL));

-- ============ COMMENTS ============
CREATE TYPE public.comment_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text,
  rating smallint CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  body text NOT NULL CHECK (length(btrim(body)) >= 2 AND length(btrim(body)) <= 2000),
  status public.comment_status NOT NULL DEFAULT 'pending',
  moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_single_target CHECK (num_nonnulls(product_id, article_id) = 1)
);
CREATE INDEX idx_comments_product ON public.comments(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_comments_article ON public.comments(article_id) WHERE article_id IS NOT NULL;
CREATE INDEX idx_comments_status ON public.comments(status);

GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments public read" ON public.comments FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "comments own read" ON public.comments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "comments own insert" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending' AND moderated_by IS NULL);
CREATE POLICY "comments staff moderate" ON public.comments FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "comments delete" ON public.comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ARTICLE POLLS ============
CREATE TABLE public.article_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_article_polls_article ON public.article_polls(article_id);
GRANT SELECT ON public.article_polls TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_polls TO authenticated;
GRANT ALL ON public.article_polls TO service_role;
ALTER TABLE public.article_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "polls public read" ON public.article_polls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "polls staff write" ON public.article_polls FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_article_polls_updated BEFORE UPDATE ON public.article_polls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.article_polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index integer NOT NULL CHECK (option_index >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.poll_votes TO authenticated;
GRANT ALL ON public.poll_votes TO service_role;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poll votes own" ON public.poll_votes FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.poll_results(_poll_id uuid)
RETURNS TABLE (option_index integer, votes bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.option_index, count(*)::bigint
  FROM public.poll_votes v
  WHERE v.poll_id = _poll_id
  GROUP BY v.option_index
$$;
GRANT EXECUTE ON FUNCTION public.poll_results(uuid) TO anon, authenticated;