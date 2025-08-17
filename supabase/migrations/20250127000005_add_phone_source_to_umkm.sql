-- Add phone_source column to umkm table
-- This column stores whether the phone number comes from 'suami' or 'istri'
ALTER TABLE public.umkm 
ADD COLUMN phone_source VARCHAR(10) CHECK (phone_source IN ('suami', 'istri') OR phone_source IS NULL);

-- Add comment for documentation
COMMENT ON COLUMN public.umkm.phone_source IS 'Source of phone number: suami or istri from warga data';