
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KategoriKas {
  id: string
  nama: string
  deskripsi: string | null
  status_aktif: boolean
}

export const useKategoriKas = () => {
  const [kategoriList, setKategoriList] = useState<KategoriKas[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKategoriKas = async (includeInactive = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('kategori_kas_keluar')
        .select('id, nama, deskripsi, status_aktif')
        .order('nama');
      
      if (!includeInactive) {
        query = query.eq('status_aktif', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching kategori kas:', error);
        return;
      }
      
      setKategoriList(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategoriKas();
  }, []);

  return {
    kategoriList,
    loading,
    fetchKategoriKas
  };
};
