-- Add slug_url column to umkm table
ALTER TABLE public.umkm 
ADD COLUMN slug_url VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN public.umkm.slug_url IS 'URL-friendly slug for UMKM detail page routing';

-- Create index for better performance on slug lookups
CREATE INDEX idx_umkm_slug_url ON public.umkm(slug_url);

-- Update existing records to generate slug_url from nama_umkm
UPDATE public.umkm 
SET slug_url = LOWER(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(nama_umkm, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  )
)
WHERE slug_url IS NULL;