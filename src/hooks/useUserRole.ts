
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
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
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
