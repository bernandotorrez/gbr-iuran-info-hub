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
      
      if (data && typeof data === 'object') {
        setDashboardStats({
          total_warga: Number(data.total_warga) || 0,
          total_kas_masuk: Number(data.total_kas_masuk) || 0,
          total_kas_keluar: Number(data.total_kas_keluar) || 0,
          saldo_kas: Number(data.saldo_kas) || 0,
          iuran_bulan_ini: Number(data.iuran_bulan_ini) || 0
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

  return {
    dashboardStats,
    loading,
    fetchDashboardStats,
    fetchWarga,
    fetchTipeIuran,
    fetchIuran,
    fetchKasKeluar
  };
};
