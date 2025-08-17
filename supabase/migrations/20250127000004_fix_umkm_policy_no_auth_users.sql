-- Fix UMKM RLS policy to avoid accessing auth.users table
-- Remove dependency on auth.users table which causes permission denied error

-- Drop existing policies that reference auth.users
DROP POLICY IF EXISTS "Admin can manage all UMKM" ON umkm;
DROP POLICY IF EXISTS "Admin can view all UMKM" ON umkm;

-- Create new admin policy that only uses warga_new table
CREATE POLICY "Admin can manage all UMKM" ON umkm
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM warga_new 
            WHERE warga_new.id = auth.uid() 
            AND LOWER(warga_new.role::text) = 'admin'
        )
    );

-- Create policy for public access to active UMKM
CREATE POLICY "Public can view active UMKM" ON umkm
    FOR SELECT USING (
        status = 'aktif'
        OR
        EXISTS (
            SELECT 1 FROM warga_new 
            WHERE warga_new.id = auth.uid() 
            AND LOWER(warga_new.role::text) = 'admin'
        )
    );

-- Create policy for warga to manage their own UMKM
CREATE POLICY "Warga can manage own UMKM" ON umkm
    FOR ALL USING (
        warga_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM warga_new 
            WHERE warga_new.id = auth.uid() 
            AND LOWER(warga_new.role::text) = 'admin'
        )
    );