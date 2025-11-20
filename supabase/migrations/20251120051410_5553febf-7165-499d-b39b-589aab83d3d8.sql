-- Add two-factor authentication support to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;

-- Create OTP codes table for 2FA
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on otp_codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for otp_codes
CREATE POLICY "Users can view their own OTP codes"
  ON public.otp_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OTP codes"
  ON public.otp_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP codes"
  ON public.otp_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON public.otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Create function to clean expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now();
END;
$$;

-- Add email domain validation function
CREATE OR REPLACE FUNCTION public.validate_chitkara_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email NOT LIKE '%@chitkara.edu.in' THEN
    RAISE EXCEPTION 'Only Chitkara University email addresses (@chitkara.edu.in) are allowed';
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to validate email domain on profile insert/update
DROP TRIGGER IF EXISTS validate_chitkara_email_trigger ON public.profiles;
CREATE TRIGGER validate_chitkara_email_trigger
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_chitkara_email();