-- Fix UMKM RLS policy for admin access
-- The current policy checks for 'Admin' (capital A) but the app uses 'admin' (lowercase)

-- Drop the existing admin policy
DROP POLICY IF EXISTS "Admin can manage all UMKM" ON umkm;

-- Create new admin policy that checks for both 'admin' and 'Admin' for compatibility
CREATE POLICY "Admin can manage all UMKM" ON umkm
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                LOWER(auth.users.raw_user_meta_data->>'role') = 'admin'
            )
        )
        OR
        EXISTS (
            SELECT 1 FROM warga_new 
            WHERE warga_new.id = auth.uid() 
            AND LOWER(warga_new.role::text) = 'admin'
        )
    );

-- Also create a policy that allows admin to see all UMKM regardless of status
CREATE POLICY "Admin can view all UMKM" ON umkm
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                LOWER(auth.users.raw_user_meta_data->>'role') = 'admin'
            )
        )
        OR
        EXISTS (
            SELECT 1 FROM warga_new 
            WHERE warga_new.id = auth.uid() 
            AND LOWER(warga_new.role::text) = 'admin'
        )
        OR
        status = 'aktif'
    );