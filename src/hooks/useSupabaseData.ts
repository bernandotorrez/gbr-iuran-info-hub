
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const { session } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    total_warga: 0,
    total_kas_masuk: 0,
    total_kas_keluar: 0,
    saldo_kas: 0,
    iuran_bulan_ini: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Error fetching dashboard stats:', error);
        return;
      }
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const statsData = data as any;
        setDashboardStats({
          total_warga: Number(statsData.total_warga) || 0,
          total_kas_masuk: Number(statsData.total_kas_masuk) || 0,
          total_kas_keluar: Number(statsData.total_kas_keluar) || 0,
          saldo_kas: Number(statsData.saldo_kas) || 0,
          iuran_bulan_ini: Number(statsData.iuran_bulan_ini) || 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarga = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'warga')
      .order('nama');
    
    if (error) {
      console.error('Error fetching warga:', error);
      return [];
    }
    
    return data || [];
  };

  const addWarga = async (wargaData: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        ...wargaData,
        role: 'warga',
        status_aktif: true
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding warga:', error);
      throw error;
    }
    
    return data;
  };

  const updateWarga = async (id: string, wargaData: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(wargaData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating warga:', error);
      throw error;
    }
    
    return data;
  };

  const deleteWarga = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting warga:', error);
      throw error;
    }
  };

  const fetchTipeIuran = async () => {
    const { data, error } = await supabase
      .from('tipe_iuran')
      .select('*')
      .eq('status_aktif', true)
      .order('nama');
    
    if (error) {
      console.error('Error fetching tipe iuran:', error);
      return [];
    }
    
    return data || [];
  };

  const addTipeIuran = async (tipeIuranData: any) => {
    const { data, error } = await supabase
      .from('tipe_iuran')
      .insert([{
        ...tipeIuranData,
        status_aktif: true
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding tipe iuran:', error);
      throw error;
    }
    
    return data;
  };

  const updateTipeIuran = async (id: string, tipeIuranData: any) => {
    const { data, error } = await supabase
      .from('tipe_iuran')
      .update(tipeIuranData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating tipe iuran:', error);
      throw error;
    }
    
    return data;
  };

  const deleteTipeIuran = async (id: string) => {
    const { error } = await supabase
      .from('tipe_iuran')
      .update({ status_aktif: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting tipe iuran:', error);
      throw error;
    }
  };

  const fetchIuran = async () => {
    const { data, error } = await supabase
      .from('iuran')
      .select(`
        *,
        warga:profiles!warga_id(nama, alamat, rt_rw),
        tipe_iuran:tipe_iuran!tipe_iuran_id(nama)
      `)
      .order('tanggal_bayar', { ascending: false });
    
    if (error) {
      console.error('Error fetching iuran:', error);
      return [];
    }
    
    return data || [];
  };

  const addIuran = async (iuranData: any) => {
    const { data, error } = await supabase
      .from('iuran')
      .insert([{
        ...iuranData,
        status_verifikasi: 'verified'
      }])
      .select(`
        *,
        warga:profiles!warga_id(nama, alamat, rt_rw),
        tipe_iuran:tipe_iuran!tipe_iuran_id(nama)
      `)
      .single();
    
    if (error) {
      console.error('Error adding iuran:', error);
      throw error;
    }
    
    return data;
  };

  const fetchKasKeluar = async () => {
    const { data, error } = await supabase
      .from('kas_keluar')
      .select(`
        *,
        diinput_oleh:profiles!diinput_oleh(nama),
        disetujui_oleh:profiles!disetujui_oleh(nama)
      `)
      .order('tanggal_keluar', { ascending: false });
    
    if (error) {
      console.error('Error fetching kas keluar:', error);
      return [];
    }
    
    return data || [];
  };

  const addKasKeluar = async (kasKeluarData: any) => {
    const { data, error } = await supabase
      .from('kas_keluar')
      .insert([{
        ...kasKeluarData,
        diinput_oleh: session?.user?.id,
        status_persetujuan: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding kas keluar:', error);
      throw error;
    }
    
    return data;
  };

  const updateKasKeluarStatus = async (id: string, status: string, userId?: string) => {
    const updateData: any = { status_persetujuan: status };
    
    if (status === 'approved' && userId) {
      updateData.disetujui_oleh = userId;
      updateData.tanggal_persetujuan = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('kas_keluar')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating kas keluar status:', error);
      throw error;
    }
    
    return data;
  };

  return {
    dashboardStats,
    loading,
    fetchDashboardStats,
    // Warga functions
    fetchWarga,
    addWarga,
    updateWarga,
    deleteWarga,
    // Tipe Iuran functions
    fetchTipeIuran,
    addTipeIuran,
    updateTipeIuran,
    deleteTipeIuran,
    // Iuran functions
    fetchIuran,
    addIuran,
    // Kas Keluar functions
    fetchKasKeluar,
    addKasKeluar,
    updateKasKeluarStatus
  };
};
