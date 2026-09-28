-- Read access the admin portal's funnel needs (itsnang/sayyesly-admin): an
-- Invite's random id, and an Answer's kind and time. Never the question,
-- names, the Recipient's note or the agreed time. Column grants only.
-- Skipped where the admin's restricted role doesn't exist (e.g. a dev database).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'sayyesly_admin') THEN
    GRANT SELECT (id, creator_id, theme_id, created_at) ON public.invites TO sayyesly_admin;
    GRANT SELECT (invite_id, kind, created_at) ON public.answers TO sayyesly_admin;
  END IF;
END
$$;
