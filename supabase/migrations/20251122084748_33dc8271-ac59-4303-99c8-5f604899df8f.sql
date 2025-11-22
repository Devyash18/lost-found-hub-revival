-- Create notifications table for matching items
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  matched_item_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_item FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_matched_item FOREIGN KEY (matched_item_id) REFERENCES public.items(id) ON DELETE CASCADE
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Create activities table for timeline
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for activities
CREATE POLICY "Users can view their own activities"
  ON public.activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);

-- Function to auto-delete old activities (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.activities
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

-- Function to create activity log
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log item creation
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'items' THEN
    INSERT INTO public.activities (user_id, activity_type, description, metadata)
    VALUES (
      NEW.user_id,
      'item_reported',
      CASE 
        WHEN NEW.type = 'lost' THEN 'Reported a lost item: ' || NEW.title
        ELSE 'Reported a found item: ' || NEW.title
      END,
      jsonb_build_object('item_id', NEW.id, 'item_type', NEW.type, 'item_title', NEW.title)
    );
  END IF;
  
  -- Log claim creation
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'claims' THEN
    INSERT INTO public.activities (user_id, activity_type, description, metadata)
    VALUES (
      NEW.claimer_id,
      'claim_made',
      'Made a claim on an item',
      jsonb_build_object('claim_id', NEW.id, 'item_id', NEW.item_id)
    );
  END IF;
  
  -- Log profile updates
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'profiles' THEN
    INSERT INTO public.activities (user_id, activity_type, description, metadata)
    VALUES (
      NEW.id,
      'profile_updated',
      'Updated profile information',
      jsonb_build_object('profile_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for activity logging
CREATE TRIGGER log_item_activity
  AFTER INSERT ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_claim_activity
  AFTER INSERT ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_profile_activity
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

-- Function to find matching items and create notifications
CREATE OR REPLACE FUNCTION public.check_matching_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matching_item RECORD;
BEGIN
  -- Find items with similar titles (opposite type)
  FOR matching_item IN
    SELECT i.*, p.email
    FROM public.items i
    JOIN public.profiles p ON p.id = i.user_id
    WHERE i.id != NEW.id
      AND i.type != NEW.type
      AND i.status = 'pending'
      AND (
        LOWER(i.title) LIKE '%' || LOWER(NEW.title) || '%'
        OR LOWER(NEW.title) LIKE '%' || LOWER(i.title) || '%'
        OR similarity(LOWER(i.title), LOWER(NEW.title)) > 0.3
      )
  LOOP
    -- Create notification for the matching item owner
    INSERT INTO public.notifications (user_id, item_id, matched_item_id, title, message)
    VALUES (
      matching_item.user_id,
      matching_item.id,
      NEW.id,
      'Potential Match Found!',
      'A ' || NEW.type || ' item matching "' || matching_item.title || '" has been reported: "' || NEW.title || '"'
    );
    
    -- Create notification for the new item owner
    INSERT INTO public.notifications (user_id, item_id, matched_item_id, title, message)
    VALUES (
      NEW.user_id,
      NEW.id,
      matching_item.id,
      'Potential Match Found!',
      'Your ' || NEW.type || ' item "' || NEW.title || '" may match an existing ' || matching_item.type || ' report: "' || matching_item.title || '"'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Enable pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigger for matching items
CREATE TRIGGER check_matching_items_trigger
  AFTER INSERT ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_matching_items();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;