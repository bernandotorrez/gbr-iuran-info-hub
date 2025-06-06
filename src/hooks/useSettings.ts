
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Setting {
  key: string
  value: string | null
  description: string | null
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, description');
      
      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }
      
      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>) || {};
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });
    
    if (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateMultipleSettings = async (settingsToUpdate: Record<string, string>) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const updates = Object.entries(settingsToUpdate).map(([key, value]) => ({
      key,
      value,
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(updates, {
        onConflict: 'key'
      });
    
    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
    
    setSettings(prev => ({
      ...prev,
      ...settingsToUpdate
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    updateSetting,
    updateMultipleSettings
  };
};
