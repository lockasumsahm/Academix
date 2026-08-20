ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS message_privacy text NOT NULL DEFAULT 'everyone';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_message_privacy_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_message_privacy_check CHECK (message_privacy IN ('everyone','following'));

GRANT SELECT (message_privacy) ON public.profiles TO authenticated;