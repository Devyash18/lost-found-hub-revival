-- Fix search_path for cleanup_expired_otps function
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now();
END;
$$;

-- Fix search_path for validate_chitkara_email function
CREATE OR REPLACE FUNCTION public.validate_chitkara_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.email NOT LIKE '%@chitkara.edu.in' THEN
    RAISE EXCEPTION 'Only Chitkara University email addresses (@chitkara.edu.in) are allowed';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix search_path for existing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;