-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('customer','editor','support','admin','super_admin');
CREATE TYPE public.content_status AS ENUM ('draft','published','archived');

-- ============ SHARED FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('editor','admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','super_admin')
  );
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- auto-provision profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated
  USING (is_active AND deleted_at IS NULL);
CREATE POLICY "categories staff write" ON public.categories FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ TAGS ============
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags public read" ON public.tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tags staff write" ON public.tags FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  file_format TEXT,
  price_toman INTEGER NOT NULL DEFAULT 0,
  compare_at_toman INTEGER,
  is_free BOOLEAN NOT NULL DEFAULT false,
  cover_image_url TEXT,
  badge TEXT,
  rating_avg NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status, published_at DESC);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "products staff read" ON public.products FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "products staff write" ON public.products FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCT TAGS ============
CREATE TABLE public.product_tags (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
GRANT SELECT ON public.product_tags TO anon;
GRANT SELECT, INSERT, DELETE ON public.product_tags TO authenticated;
GRANT ALL ON public.product_tags TO service_role;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_tags public read" ON public.product_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_tags staff write" ON public.product_tags FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ PRODUCT IMAGES ============
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images public read" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_images staff write" ON public.product_images FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ PRODUCT FILES (private) ============
CREATE TABLE public.product_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  label TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  release_notes TEXT,
  size_bytes BIGINT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_product_files_product ON public.product_files(product_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_files TO authenticated;
GRANT ALL ON public.product_files TO service_role;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_files staff only" ON public.product_files FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_product_files_updated BEFORE UPDATE ON public.product_files
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (product_id, user_id)
);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated
  USING (is_approved AND deleted_at IS NULL);
CREATE POLICY "reviews own read" ON public.reviews FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "reviews own insert" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews own update" ON public.reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "reviews own delete" ON public.reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ARTICLES ============
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_articles_status ON public.articles(status, published_at DESC);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles public read" ON public.articles FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "articles staff read" ON public.articles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "articles staff write" ON public.articles FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============ SEED ============
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
  ('risk-assessment','ارزیابی ریسک','JSA، FMEA، HAZOP و William Fine','ClipboardCheck',1),
  ('occupational-health','بهداشت حرفه‌ای','اندازه‌گیری عوامل زیان‌آور محیط کار','Activity',2),
  ('industrial-safety','ایمنی صنعتی','چک‌لیست بازرسی و پرمیت کار','HardHat',3),
  ('ergonomics','ارگونومی','REBA، RULA، NIOSH و QEC','Users',4),
  ('ventilation','تهویه صنعتی','طراحی هود و محاسبات جریان هوا','Wind',5),
  ('training','آموزش و مستندات','پاورپوینت، دستورالعمل و رویه‌ها','BookOpen',6);

INSERT INTO public.tags (slug, name) VALUES
  ('excel','اکسل'),('checklist','چک‌لیست'),('iso','ایزو'),('hazop','HAZOP'),('reba','REBA');

INSERT INTO public.products (category_id, slug, title, subtitle, description, file_format, price_toman, badge, rating_avg, rating_count, download_count, status, published_at, seo_title, seo_description)
SELECT c.id, v.slug, v.title, v.subtitle, v.description, v.file_format, v.price, v.badge, v.rating, v.rc, v.dc, 'published', now(), v.title, v.subtitle
FROM (VALUES
  ('risk-assessment','william-fine-risk-package','پکیج کامل ارزیابی ریسک به روش William Fine','فرم‌ها، جداول امتیازدهی و گزارش نهایی آماده','مجموعه‌ای کامل شامل فرم‌های ارزیابی ریسک، جداول امتیازدهی پیامد، مواجهه و احتمال، به همراه گزارش نمونه و راهنمای تکمیل.','Excel + PDF',290000,'پرفروش',4.9,132,1840),
  ('industrial-safety','safety-inspection-checklists','مجموعه چک‌لیست‌های بازرسی ایمنی کارگاه','۴۸ چک‌لیست قابل ویرایش برای بازرسی‌های دوره‌ای','چک‌لیست‌های بازرسی ایمنی برای داربست، برق، جوشکاری، کار در ارتفاع، فضای بسته و بیش از ۴۰ موضوع دیگر.','۴۸ چک‌لیست Word',190000,'به‌روزرسانی ۱۴۰۴',4.8,96,2310),
  ('ergonomics','reba-rula-excel-tool','نرم‌افزار اکسل محاسبات ارگونومی REBA و RULA','محاسبه خودکار امتیاز و سطح اقدام اصلاحی','ابزار اکسل با فرمول‌نویسی کامل برای محاسبه امتیاز REBA و RULA، تولید خودکار سطح ریسک و پیشنهاد اقدام اصلاحی.','Excel خودکار',240000,'جدید',5.0,54,760)
) AS v(cat, slug, title, subtitle, description, file_format, price, badge, rating, rc, dc)
JOIN public.categories c ON c.slug = v.cat;

INSERT INTO public.articles (category_id, slug, title, excerpt, content, reading_minutes, status, published_at, seo_title, seo_description)
SELECT c.id, v.slug, v.title, v.excerpt, v.content, v.mins, 'published', now(), v.title, v.excerpt
FROM (VALUES
  ('risk-assessment','risk-assessment-program-guide','راهنمای گام‌به‌گام تدوین برنامه ارزیابی ریسک در صنایع فرآیندی','از تعیین دامنه تا پایش اقدامات کنترلی؛ نقشه راه عملی برای کارشناسان HSE.','تدوین یک برنامه ارزیابی ریسک اثربخش با تعیین دامنه و شناسایی فرآیندها آغاز می‌شود...',9),
  ('occupational-health','oel-guide','حدود مجاز مواجهه شغلی؛ آنچه هر کارشناس بهداشت حرفه‌ای باید بداند','مروری کاربردی بر مفاهیم TWA، STEL و Ceiling و نحوه استفاده از آن‌ها.','حدود مجاز مواجهه شغلی مبنای قضاوت درباره سلامت شاغلین در محیط کار است...',7),
  ('ergonomics','msd-low-cost-interventions','کاهش اختلالات اسکلتی-عضلانی با مداخلات ارگونومیک کم‌هزینه','مداخلات ساده‌ای که بدون سرمایه‌گذاری سنگین، ریسک MSDs را کاهش می‌دهند.','بسیاری از اختلالات اسکلتی-عضلانی با اصلاح ارتفاع سطح کار و چیدمان ابزار قابل پیشگیری است...',6)
) AS v(cat, slug, title, excerpt, content, mins)
JOIN public.categories c ON c.slug = v.cat;