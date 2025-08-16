-- Add slug_url column to artikel_berita table
ALTER TABLE public.artikel_berita 
ADD COLUMN slug_url VARCHAR UNIQUE;

-- Create index for better performance on slug_url lookups
CREate INDEX idx_artikel_berita_slug_url ON public.artikel_berita(slug_url);

-- Add comment to explain the column
COMMENT ON COLUMN public.artikel_berita.slug_url IS 'Unique URL slug generated from article title for SEO-friendly URLs';