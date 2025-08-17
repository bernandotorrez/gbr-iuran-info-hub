-- Create UMKM table with relation to warga_new and tag field
CREATE TABLE umkm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_umkm VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  alamat TEXT,
  nomor_telepon VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  jam_operasional TEXT,
  tag VARCHAR(100) NOT NULL, -- untuk filter: gas, galon, siomay, dll
  gambar_url TEXT,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  warga_id UUID REFERENCES warga_new(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_umkm_warga_id ON umkm(warga_id);
CREATE INDEX idx_umkm_tag ON umkm(tag);
CREATE INDEX idx_umkm_status ON umkm(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_umkm_updated_at BEFORE UPDATE ON umkm
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Admin can do everything
CREATE POLICY "Admin can manage all UMKM" ON umkm
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Admin'
        )
    );

-- Public can only read active UMKM
CREATE POLICY "Public can view active UMKM" ON umkm
    FOR SELECT USING (status = 'aktif');

-- Warga can only manage their own UMKM
CREATE POLICY "Warga can manage own UMKM" ON umkm
    FOR ALL USING (
        warga_id IN (
            SELECT id FROM warga_new 
            WHERE user_id = auth.uid()
        )
    );

-- Insert some sample data
INSERT INTO umkm (nama_umkm, deskripsi, alamat, nomor_telepon, tag, status, warga_id) VALUES
('Warung Gas Bu Siti', 'Penjual gas elpiji 3kg dan 12kg', 'Blok A No. 15', '081234567890', 'gas', 'aktif', 
    (SELECT id FROM warga_new LIMIT 1)),
('Depot Air Galon Pak Budi', 'Penjual air galon berbagai merk', 'Blok B No. 8', '081234567891', 'galon', 'aktif', 
    (SELECT id FROM warga_new LIMIT 1)),
('Siomay Bandung Ibu Ani', 'Siomay dan batagor enak dan murah', 'Blok C No. 22', '081234567892', 'siomay', 'aktif', 
    (SELECT id FROM warga_new LIMIT 1));