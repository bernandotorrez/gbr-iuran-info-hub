-- Make phone, email, and website fields nullable in UMKM table
ALTER TABLE public.umkm 
  ALTER COLUMN nomor_telepon DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN website DROP NOT NULL;

-- Update existing empty strings to NULL for better data consistency
UPDATE public.umkm 
SET 
  nomor_telepon = CASE WHEN nomor_telepon = '' THEN NULL ELSE nomor_telepon END,
  email = CASE WHEN email = '' THEN NULL ELSE email END,
  website = CASE WHEN website = '' THEN NULL ELSE website END;

-- Add check constraints to ensure valid formats when values are provided
ALTER TABLE public.umkm 
  ADD CONSTRAINT check_email_format 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT check_website_format 
    CHECK (website IS NULL OR website ~* '^https?://.*' OR website ~* '^www\.' OR website ~* '^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$');

-- Add comment for documentation
COMMENT ON COLUMN public.umkm.nomor_telepon IS 'Nomor telepon UMKM (opsional)';
COMMENT ON COLUMN public.umkm.email IS 'Email UMKM (opsional, harus format email valid)';
COMMENT ON COLUMN public.umkm.website IS 'Website UMKM (opsional, harus format URL valid)';