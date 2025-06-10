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
  foto_url?: string | null
}

interface FetchOptions {
  includeInactive?: boolean
  periodeStart?: number
  periodeEnd?: number
}

export const useStrukturPengurus = () => {
  const [strukturList, setStrukturList] = useState<StrukturPengurus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStrukturPengurus = async (options: FetchOptions = {}) => {
    const { includeInactive = false, periodeStart, periodeEnd } = options;
    
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

      // Add periode filters if provided
      if (periodeStart !== undefined) {
        query = query.eq('periode_mulai', periodeStart);
      }

      if (periodeEnd !== undefined) {
        query = query.eq('periode_selesai', periodeEnd);
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

  // New function to get all available periods
  const fetchAvailablePeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('struktur_pengurus')
        .select('periode_mulai, periode_selesai')
        .eq('status_aktif', true);
      
      if (error) {
        console.error('Error fetching periods:', error);
        return [];
      }

      // Get unique periods and sort them
      const uniquePeriods = Array.from(
        new Set(
          data.map(item => `${item.periode_mulai}-${item.periode_selesai}`)
        )
      ).sort((a, b) => {
        const yearA = parseInt(a.split('-')[0]);
        const yearB = parseInt(b.split('-')[0]);
        return yearB - yearA; // Sort descending (newest first)
      });

      return uniquePeriods;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  // New function to fetch struktur by specific periode string (e.g., "2024-2025")
  const fetchStrukturByPeriode = async (periodeString: string, includeInactive = false) => {
    try {
      setLoading(true);
      
      if (!periodeString) {
        setStrukturList([]);
        return;
      }

      const [periodeStart, periodeEnd] = periodeString.split('-').map(Number);
      
      let query = supabase
        .from('struktur_pengurus')
        .select('*')
        .eq('periode_mulai', periodeStart)
        .eq('periode_selesai', periodeEnd)
        .order('level_jabatan')
        .order('nama_pengurus');
      
      if (!includeInactive) {
        query = query.eq('status_aktif', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching struktur pengurus by periode:', error);
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
    fetchAvailablePeriods,
    fetchStrukturByPeriode,
    addStrukturPengurus,
    updateStrukturPengurus,
    deleteStrukturPengurus
  };
};