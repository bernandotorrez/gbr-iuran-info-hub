
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define valid status types for articles
type ArticleStatus = "draft" | "published" | "archived";

// Helper function to validate article status
const validateArticleStatus = (status: string | null | undefined): ArticleStatus => {
  if (status === "published" || status === "draft" || status === "archived") {
    return status;
  }
  return "draft"; // Default to draft for any invalid status
}

export const useSupabaseData = () => {
  const { session } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    total_warga: 0,
    total_kas_masuk: 0,
    total_kas_keluar: 0,
    saldo_kas: 0,
    iuran_bulan_ini: 0,
    filter_month: new Date().getMonth() + 1,
    filter_year: new Date().getFullYear(),
    tingkat_pembayaran: 0,
    total_warga_sudah_bayar: 0,
    total_warga_belum_bayar: 0,
    percent_warga_sudah_bayar: 0,
    percent_warga_belum_bayar: 0
  });
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async (month?: number, year?: number, tipeIuran?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_stats_filtered', {
        target_month: month || currentMonth,
        target_year: year || currentYear,
        target_tipe_iuran_id: tipeIuran || null
      });
      
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
          iuran_bulan_ini: Number(statsData.iuran_bulan_ini) || 0,
          filter_month: Number(statsData.filter_month) || new Date().getMonth() + 1,
          filter_year: Number(statsData.filter_year) || new Date().getFullYear(),
          tingkat_pembayaran: Number(statsData.tingkat_pembayaran) || 0,
          total_warga_sudah_bayar: Number(statsData.total_warga_sudah_bayar) || 0,
          total_warga_belum_bayar: Number(statsData.total_warga_belum_bayar) || 0,
          percent_warga_sudah_bayar: Number(statsData.percent_warga_sudah_bayar) || 0,
          percent_warga_belum_bayar: Number(statsData.percent_warga_belum_bayar) || 0
        });

        return data || [];
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // New warga functions using warga_new table
  const fetchWarga = async () => {
    const { data, error } = await supabase
      .from('warga_new')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching warga:', error);
      return [];
    }
    
    return data || [];
  };

  const addWarga = async (wargaData: any) => {
    const { data, error } = await supabase
      .from('warga_new')
      .insert([wargaData])
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
      .from('warga_new')
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
      .from('warga_new')
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

  const fetchIuran = async (month?: number, year?: number, tipeIuran?: string) => {
    let query = supabase
      .from('iuran')
      .select(`
        *,
        warga:warga_new!warga_id(nama_suami, nama_istri, blok_rumah),
        tipe_iuran:tipe_iuran!tipe_iuran_id(nama)
      `);

    if (month && year) {
      query = query
        .eq('bulan', month)
        .eq('tahun', year);
    }

    if (tipeIuran) {
      query = query
        .eq('tipe_iuran_id', tipeIuran);
    }

    const { data, error } = await query.order('tanggal_bayar', { ascending: false });
    
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
        warga:warga_new!warga_id(nama_suami, nama_istri, blok_rumah),
        tipe_iuran:tipe_iuran!tipe_iuran_id(nama)
      `)
      .single();
    
    if (error) {
      console.error('Error adding iuran:', error);
      throw error;
    }
    
    return data;
  };

  const deleteIuran = async (id: string) => {
    const { error } = await supabase
      .from('iuran')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting Iuran:', error);
      throw error;
    }
  };

  const fetchKasKeluar = async (month?: number, year?: number) => {
    let query = supabase
      .from('kas_keluar')
      .select(`
        *,
        diinput_oleh:warga_new!diinput_oleh(nama_suami, nama_istri),
        disetujui_oleh:warga_new!disetujui_oleh(nama_suami, nama_istri)
      `);

    if (month && year) {
      query = query
        .gte('tanggal_keluar', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('tanggal_keluar', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);
    }

    const { data, error } = await query.order('tanggal_keluar', { ascending: false });
    
    if (error) {
      console.error('Error fetching kas keluar:', error);
      return [];
    }
    
    // Ensure tipe_iuran is included and has a default value if null
    const processedData = (data || []).map(item => ({
      ...item,
      tipe_iuran: item.tipe_iuran || 'Tidak Ditentukan'
    }));
    
    return processedData;
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

  // Artikel functions with improved type handling
  const fetchArtikel = async () => {
    const { data, error } = await supabase
      .from('artikel_berita')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching artikel:', error);
      return [];
    }
    
    return data || [];
  };

  const addArtikel = async (artikelData: any) => {
    // Ensure the status is valid before sending to the database
    const status = validateArticleStatus(artikelData.status);
    
    const { data, error } = await supabase
      .from('artikel_berita')
      .insert([{
        ...artikelData,
        status,
        author_id: session?.user?.id,
        published_at: status === 'published' ? new Date().toISOString() : null
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding artikel:', error);
      throw error;
    }
    
    return data;
  };

  const updateArtikel = async (id: string, artikelData: any) => {
    const updateData = { ...artikelData };
    
    // Validate and set the status if provided
    if (artikelData.status) {
      updateData.status = validateArticleStatus(artikelData.status);
    }
    
    // Set published_at when status changes to published
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('artikel_berita')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating artikel:', error);
      throw error;
    }
    
    return data;
  };

  const deleteArtikel = async (id: string) => {
    const { error } = await supabase
      .from('artikel_berita')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting artikel:', error);
      throw error;
    }
  };

  const uploadImageArtikel = async (file: File, fileName: string): Promise<string> => {
    try {
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(`artikel_images/${fileName}`, file)

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`artikel_images/${fileName}`)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const deleteImageArtikel = async (fileName: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([fileName])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

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
    deleteIuran,
    // Kas Keluar functions
    fetchKasKeluar,
    addKasKeluar,
    updateKasKeluarStatus,
    // Artikel functions
    fetchArtikel,
    addArtikel,
    updateArtikel,
    deleteArtikel,
    uploadImageArtikel,
    deleteImageArtikel
  };
};
