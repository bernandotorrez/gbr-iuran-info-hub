-- Fix the RLS policy for DELETE on iuran table
-- The current "Admin Can Delete" policy is actually a SELECT policy, we need a proper DELETE policy

-- First drop the misnamed policy
DROP POLICY IF EXISTS "Admin Can Delete" ON public.iuran;

-- Add proper SELECT policy for admins
CREATE POLICY "Admin Can Read All"
ON public.iuran
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM warga_new 
    WHERE warga_new.id = auth.uid() 
    AND warga_new.role::text = 'admin'::text
  )
);

-- Add proper DELETE policy for admins
CREATE POLICY "Admin Can Delete"
ON public.iuran
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM warga_new 
    WHERE warga_new.id = auth.uid() 
    AND warga_new.role::text = 'admin'::text
  )
);

-- Also add bukti_transfer_url column to kas_keluar table if it doesn't exist
ALTER TABLE public.kas_keluar 
ADD COLUMN IF NOT EXISTS bukti_transfer_url TEXT;