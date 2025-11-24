-- Create appointments table for scheduling item handoffs
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies: Users involved in the claim can view/manage appointments
CREATE POLICY "Users can view appointments for their claims" ON public.appointments
  FOR SELECT USING (
    created_by = auth.uid() OR
    auth.uid() IN (
      SELECT c.claimer_id FROM claims c WHERE c.id = claim_id
      UNION
      SELECT i.user_id FROM claims c JOIN items i ON i.id = c.item_id WHERE c.id = claim_id
    )
  );

CREATE POLICY "Users can create appointments for their claims" ON public.appointments
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    auth.uid() IN (
      SELECT c.claimer_id FROM claims c WHERE c.id = claim_id
      UNION
      SELECT i.user_id FROM claims c JOIN items i ON i.id = c.item_id WHERE c.id = claim_id
    )
  );

CREATE POLICY "Users can update appointments for their claims" ON public.appointments
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT c.claimer_id FROM claims c WHERE c.id = claim_id
      UNION
      SELECT i.user_id FROM claims c JOIN items i ON i.id = c.item_id WHERE c.id = claim_id
    )
  );

CREATE POLICY "Users can delete their own appointments" ON public.appointments
  FOR DELETE USING (created_by = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_appointments_claim_id ON public.appointments(claim_id);
CREATE INDEX idx_appointments_scheduled_time ON public.appointments(scheduled_time);

-- Trigger to update updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to send appointment reminder notifications (called by scheduled job)
CREATE OR REPLACE FUNCTION public.send_appointment_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  appointment_record RECORD;
BEGIN
  -- Find appointments happening in the next 24 hours that need reminders
  FOR appointment_record IN
    SELECT 
      a.id,
      a.claim_id,
      a.scheduled_time,
      a.location,
      c.claimer_id,
      i.user_id as item_owner_id,
      i.title as item_title
    FROM appointments a
    JOIN claims c ON c.id = a.claim_id
    JOIN items i ON i.id = c.item_id
    WHERE a.status = 'confirmed'
      AND a.scheduled_time BETWEEN now() AND (now() + INTERVAL '24 hours')
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.item_id = c.item_id
          AND n.message LIKE '%appointment reminder%'
          AND n.created_at > (now() - INTERVAL '24 hours')
      )
  LOOP
    -- Notify claimer
    INSERT INTO notifications (user_id, item_id, matched_item_id, title, message)
    VALUES (
      appointment_record.claimer_id,
      (SELECT item_id FROM claims WHERE id = appointment_record.claim_id),
      (SELECT item_id FROM claims WHERE id = appointment_record.claim_id),
      'Appointment Reminder',
      'Your appointment for "' || appointment_record.item_title || '" is scheduled for ' || 
      to_char(appointment_record.scheduled_time, 'Mon DD at HH:MI AM') || ' at ' || appointment_record.location
    );
    
    -- Notify item owner
    INSERT INTO notifications (user_id, item_id, matched_item_id, title, message)
    VALUES (
      appointment_record.item_owner_id,
      (SELECT item_id FROM claims WHERE id = appointment_record.claim_id),
      (SELECT item_id FROM claims WHERE id = appointment_record.claim_id),
      'Appointment Reminder',
      'Your appointment for "' || appointment_record.item_title || '" is scheduled for ' || 
      to_char(appointment_record.scheduled_time, 'Mon DD at HH:MI AM') || ' at ' || appointment_record.location
    );
  END LOOP;
END;
$$;