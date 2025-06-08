
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StrukturPengurus {
  id: string
  jabatan: string
  level_jabatan: number
  nama_pengurus: string
  warga_id: string | null
  blok_rumah: string | null
  periode_mulai: number
  periode_selesai: number
  status_aktif: boolean
}

export const useStrukturPengurus = () => {
  const [strukturList, setStrukturList] = useState<StrukturPengurus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStrukturPengurus = async (includeInactive = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('struktur_pengurus')
        .select('*')
        .order('level_jabatan')
        .order('nama_pengurus');
      
      if (!includeInactive) {
        query = query.eq('status_aktif', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching struktur pengurus:', error);
        return;
      }
      
      setStrukturList(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStrukturPengurus = async (strukturData: any) => {
    // Convert empty string or "none" to null for warga_id
    const processedData = {
      ...strukturData,
      warga_id: strukturData.warga_id === "" || strukturData.warga_id === "none" ? null : strukturData.warga_id,
      status_aktif: true
    };

    const { data, error } = await supabase
      .from('struktur_pengurus')
      .insert([processedData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding struktur pengurus:', error);
      throw error;
    }
    
    return data;
  };

  const updateStrukturPengurus = async (id: string, strukturData: any) => {
    // Convert empty string or "none" to null for warga_id
    const processedData = {
      ...strukturData,
      warga_id: strukturData.warga_id === "" || strukturData.warga_id === "none" ? null : strukturData.warga_id
    };

    const { data, error } = await supabase
      .from('struktur_pengurus')
      .update(processedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating struktur pengurus:', error);
      throw error;
    }
    
    return data;
  };

  const deleteStrukturPengurus = async (id: string) => {
    const { error } = await supabase
      .from('struktur_pengurus')
      .update({ status_aktif: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting struktur pengurus:', error);
      throw error;
    }
  };

  return {
    strukturList,
    loading,
    fetchStrukturPengurus,
    addStrukturPengurus,
    updateStrukturPengurus,
    deleteStrukturPengurus
  };
};
