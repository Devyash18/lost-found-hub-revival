-- Create messages table for chat between item owner and finder (via claims)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow only participants (sender or receiver) to see their messages
CREATE POLICY "Participants can read messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow only participants to insert messages
CREATE POLICY "Participants can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Helpful indexes for chat queries
CREATE INDEX idx_messages_claim_id ON public.messages (claim_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages (sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages (created_at);

-- Drop existing "System can insert notifications" policy if it exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Ensure notifications can be inserted by system triggers
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for messages (chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
