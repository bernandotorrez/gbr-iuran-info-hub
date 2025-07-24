-- Add bukti_transfer_url column to iuran table
ALTER TABLE public.iuran 
ADD COLUMN bukti_transfer_url TEXT;