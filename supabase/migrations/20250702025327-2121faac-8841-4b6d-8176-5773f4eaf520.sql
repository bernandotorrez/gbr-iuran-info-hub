
-- Buat table untuk buku tamu
CREATE TABLE public.buku_tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pengunjung VARCHAR NOT NULL,
  instansi VARCHAR,
  keperluan TEXT NOT NULL,
  nomor_hp VARCHAR,
  email VARCHAR,
  ktp_file_url TEXT,
  tanggal_kunjungan TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  waktu_masuk TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  waktu_keluar TIMESTAMP WITH TIME ZONE,
  catatan TEXT,
  status VARCHAR DEFAULT 'masuk',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS untuk table buku_tamu
ALTER TABLE public.buku_tamu ENABLE ROW LEVEL SECURITY;

-- Policy untuk security role dan admin
CREATE POLICY "Security and admin can manage buku_tamu" 
  ON public.buku_tamu 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 
      FROM warga_new 
      WHERE warga_new.id = auth.uid() 
      AND warga_new.role IN ('admin', 'security')
    )
  );

-- Update role enum di warga_new untuk menambahkan role security
ALTER TYPE residence_status ADD VALUE IF NOT EXISTS 'security';

-- Atau jika perlu menambah role baru
UPDATE warga_new SET role = 'security' WHERE role IS NULL AND id = 'some-security-user-id';
