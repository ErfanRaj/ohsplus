CREATE TABLE public.hazard_scenarios (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text NOT NULL DEFAULT '', image_url text NOT NULL, hazards jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(hazards) = 'array'), is_active boolean NOT NULL DEFAULT false, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.hazard_scenarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hazard_scenarios TO authenticated;
GRANT ALL ON public.hazard_scenarios TO service_role;
ALTER TABLE public.hazard_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY hazard_public_read ON public.hazard_scenarios FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY hazard_staff_manage ON public.hazard_scenarios FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER hazard_updated BEFORE UPDATE ON public.hazard_scenarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();