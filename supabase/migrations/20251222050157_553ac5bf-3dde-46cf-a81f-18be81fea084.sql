-- Drop and recreate the matching function with improved algorithm
CREATE OR REPLACE FUNCTION public.check_matching_items()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  matching_item RECORD;
BEGIN
  -- Find items with similar titles, same category, or similar description (opposite type)
  FOR matching_item IN
    SELECT i.*, p.email
    FROM public.items i
    JOIN public.profiles p ON p.id = i.user_id
    WHERE i.id != NEW.id
      AND i.type != NEW.type
      AND i.status = 'pending'
      AND (
        -- Category match (same category is a strong signal)
        i.category = NEW.category
        -- OR title similarity
        OR similarity(LOWER(i.title), LOWER(NEW.title)) > 0.2
        -- OR title contains keywords
        OR LOWER(i.title) LIKE '%' || LOWER(NEW.title) || '%'
        OR LOWER(NEW.title) LIKE '%' || LOWER(i.title) || '%'
        -- OR description similarity
        OR similarity(LOWER(i.description), LOWER(NEW.description)) > 0.25
      )
  LOOP
    -- Create notification for the matching item owner
    INSERT INTO public.notifications (user_id, item_id, matched_item_id, title, message)
    VALUES (
      matching_item.user_id,
      matching_item.id,
      NEW.id,
      'Potential Match Found!',
      'A ' || NEW.type || ' item "' || NEW.title || '" (' || NEW.category || ') may match your ' || matching_item.type || ' report: "' || matching_item.title || '"'
    );
    
    -- Create notification for the new item owner
    INSERT INTO public.notifications (user_id, item_id, matched_item_id, title, message)
    VALUES (
      NEW.user_id,
      NEW.id,
      matching_item.id,
      'Potential Match Found!',
      'Your ' || NEW.type || ' item "' || NEW.title || '" may match an existing ' || matching_item.type || ' report: "' || matching_item.title || '" (' || matching_item.category || ')'
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;