
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
          const { data, error } = await supabase
            .from('warga_new')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setUserProfile(data);
          } else {
            console.log('User profile not found in warga_new table for user ID:', user.id);
            // For users not in warga_new table, set default role as 'warga'
            setUserProfile({ role: 'warga' });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to default role
          setUserProfile({ role: 'warga' });
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
