
-- Create table for buku tamu (guest book)
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

-- Enable RLS for table buku_tamu
ALTER TABLE public.buku_tamu ENABLE ROW LEVEL SECURITY;

-- Policy for security role and admin to manage buku_tamu
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

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_buku_tamu_updated_at
  BEFORE UPDATE ON public.buku_tamu
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
