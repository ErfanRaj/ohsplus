-- 1) Role management helpers
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.can_manage_user_role(_target_user uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN public.is_super_admin(auth.uid()) THEN true
    WHEN public.has_role(auth.uid(), 'admin')
      THEN _role <> 'super_admin'
       AND NOT public.is_super_admin(_target_user)
       AND _target_user <> auth.uid()
    ELSE false
  END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_user_role(uuid, app_role) TO authenticated;

-- 2) user_roles write policies
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS "manage roles insert" ON public.user_roles;
CREATE POLICY "manage roles insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_user_role(user_id, role));

DROP POLICY IF EXISTS "manage roles update" ON public.user_roles;
CREATE POLICY "manage roles update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.can_manage_user_role(user_id, role))
  WITH CHECK (public.can_manage_user_role(user_id, role));

DROP POLICY IF EXISTS "manage roles delete" ON public.user_roles;
CREATE POLICY "manage roles delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.can_manage_user_role(user_id, role));

-- 3) Ensure the owner account is super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE lower(email) = 'erfann.rag@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4) Security: role-check functions must not be callable by anonymous visitors
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_user_role(uuid, app_role) FROM PUBLIC, anon;

-- 5) Security: replace always-true contact insert policy with validated checks
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a valid contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 2 AND 100
    AND length(btrim(email)) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(subject)) BETWEEN 3 AND 150
    AND length(btrim(message)) BETWEEN 10 AND 2000
    AND is_read = false
    AND is_answered = false
  );