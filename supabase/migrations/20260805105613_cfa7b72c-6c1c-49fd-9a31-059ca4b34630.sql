DROP FUNCTION IF EXISTS public.notify_user(uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION private.notify_on_reaction()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author uuid;
BEGIN
  SELECT author_id INTO _author FROM public.posts WHERE id = NEW.post_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, kind, title, link)
    VALUES (_author, NEW.user_id, 'reaction', 'Someone found your post ' || left(NEW.kind, 40), '/community');
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.notify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author uuid;
BEGIN
  SELECT author_id INTO _author FROM public.posts WHERE id = NEW.post_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, kind, title, body, link)
    VALUES (_author, NEW.user_id, 'comment', 'New comment on your post', left(NEW.body, 120), '/community');
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.notify_on_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, kind, title, link)
  VALUES (NEW.following_id, NEW.follower_id, 'follow', 'You have a new follower', '/researcher/' || NEW.follower_id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.notify_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, kind, title, body, link)
  SELECT cp.user_id, NEW.sender_id, 'message', 'New message', left(NEW.body, 120), '/messages'
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id AND cp.user_id <> NEW.sender_id;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION private.notify_on_reaction() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.notify_on_comment() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.notify_on_follow() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.notify_on_message() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_notify_on_reaction ON public.post_reactions;
CREATE TRIGGER trg_notify_on_reaction AFTER INSERT ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION private.notify_on_reaction();

DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.post_comments;
CREATE TRIGGER trg_notify_on_comment AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION private.notify_on_comment();

DROP TRIGGER IF EXISTS trg_notify_on_follow ON public.follows;
CREATE TRIGGER trg_notify_on_follow AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION private.notify_on_follow();

DROP TRIGGER IF EXISTS trg_notify_on_message ON public.messages;
CREATE TRIGGER trg_notify_on_message AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION private.notify_on_message();