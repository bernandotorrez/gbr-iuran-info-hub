
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          // First check user metadata for role (prioritize this for admin users)
          const userMetadataRole = user.user_metadata?.role;
          
          // If user has admin role in metadata, use it directly
          if (userMetadataRole && userMetadataRole.toLowerCase() === 'admin') {
            setUserProfile({ role: userMetadataRole });
            setLoading(false);
            return;
          }
          
          // For non-admin users, check warga_new table
          const { data, error } = await supabase
            .from('warga_new')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && data && data.role) {
            setUserProfile(data);
          } else {
            // Fallback to user metadata or default
            if (userMetadataRole) {
              setUserProfile({ role: userMetadataRole });
            } else {
              setUserProfile({ role: 'warga' });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to user metadata
          const userRole = user.user_metadata?.role;
          if (userRole) {
            setUserProfile({ role: userRole });
          } else {
            setUserProfile({ role: 'warga' });
          }
        }
      }
      setLoading(false);
    };
    
    fetchUserProfile();
  }, [user]);

  const isAdmin = userProfile?.role === 'admin';
  const isSecurity = userProfile?.role === 'security';
  const hasSecurityAccess = isAdmin || isSecurity;

  return {
    userProfile,
    loading,
    isAdmin,
    isSecurity,
    hasSecurityAccess
  };
};
