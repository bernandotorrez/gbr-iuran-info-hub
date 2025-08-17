-- Create table for UMKM tags
CREATE TABLE IF NOT EXISTS public.tag_umkm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_tag VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  warna VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create junction table for UMKM and tags (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.umkm_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  umkm_id UUID NOT NULL REFERENCES public.umkm(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tag_umkm(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(umkm_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tag_umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tag_umkm
CREATE POLICY "Allow public read access to tag_umkm" ON public.tag_umkm
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage tag_umkm" ON public.tag_umkm
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for umkm_tags
CREATE POLICY "Allow public read access to umkm_tags" ON public.umkm_tags
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage umkm_tags" ON public.umkm_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default tags
INSERT INTO public.tag_umkm (nama_tag, deskripsi, warna) VALUES
  ('Makanan & Minuman', 'Usaha kuliner, restoran, warung, katering', '#EF4444'),
  ('Fashion & Pakaian', 'Toko pakaian, aksesoris, sepatu', '#8B5CF6'),
  ('Kecantikan & Kesehatan', 'Salon, spa, klinik kecantikan, apotek', '#EC4899'),
  ('Elektronik & Gadget', 'Toko elektronik, service HP, komputer', '#3B82F6'),
  ('Otomotif', 'Bengkel, spare part, cuci mobil', '#6B7280'),
  ('Pendidikan & Kursus', 'Les privat, kursus, bimbel', '#10B981'),
  ('Jasa Profesional', 'Konsultan, akuntan, lawyer, notaris', '#F59E0B'),
  ('Konstruksi & Renovasi', 'Kontraktor, tukang, material bangunan', '#84CC16'),
  ('Pertanian & Peternakan', 'Sayuran, buah-buahan, ternak', '#22C55E'),
  ('Kerajinan & Seni', 'Handicraft, lukisan, souvenir', '#F97316'),
  ('Transportasi & Logistik', 'Ojek, taxi, ekspedisi, cargo', '#06B6D4'),
  ('Lainnya', 'Kategori lain yang tidak termasuk di atas', '#64748B')
ON CONFLICT (nama_tag) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_umkm_tags_umkm_id ON public.umkm_tags(umkm_id);
CREATE INDEX IF NOT EXISTS idx_umkm_tags_tag_id ON public.umkm_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_umkm_nama ON public.tag_umkm(nama_tag);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tag_umkm_updated_at BEFORE UPDATE ON public.tag_umkm
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();