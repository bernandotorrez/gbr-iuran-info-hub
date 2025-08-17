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

// Define the dashboard stats type
export interface DashboardStats {
  total_warga: number;
  total_kas_masuk: number;
  total_kas_keluar: number;
  saldo_kas: number;
  iuran_bulan_ini: number;
  filter_month: number;
  filter_year: number;
  tingkat_pembayaran: number;
  total_warga_sudah_bayar: number;
  total_warga_belum_bayar: number;
  percent_warga_sudah_bayar: number;
  percent_warga_belum_bayar: number;
  sisa_saldo_kas: number;
}

// Define BukuTamu interface
export interface BukuTamu {
  id: string;
  nama_pengunjung: string;
  instansi?: string;
  keperluan: string;
  nomor_hp?: string;
  email?: string;
  ktp_file_url?: string;
  tanggal_kunjungan: string;
  waktu_masuk: string;
  waktu_keluar?: string;
  catatan?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Define UMKM interface
export interface UMKM {
  id: string;
  nama_umkm: string;
  deskripsi?: string;
  alamat?: string;
  nomor_telepon?: string;
  email?: string;
  website?: string;
  jam_operasional?: string;
  tag: string;
  gambar_url?: string;
  status: string;
  warga_id?: string;
  slug_url?: string;
  created_at: string;
  updated_at?: string;
  warga_new?: {
    nama_suami: string;
    nama_istri: string;
    nomor_hp_suami: string;
    nomor_hp_istri: string;
  };
}

export const useSupabaseData = () => {
  const { session } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
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
    percent_warga_belum_bayar: 0,
    sisa_saldo_kas: 0
  });
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async (month?: number, year?: number, tipeIuran?: string): Promise<DashboardStats | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_stats_filtered', {
        target_month: month || currentMonth,
        target_year: year || currentYear,
        target_tipe_iuran_id: tipeIuran || null
      });
      
      if (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
      }
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const statsData = data as any;
        const newStats: DashboardStats = {
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
          percent_warga_belum_bayar: Number(statsData.percent_warga_belum_bayar) || 0,
          sisa_saldo_kas: Number(statsData.sisa_saldo_kas) || 0
        };

        setDashboardStats(newStats);
        return newStats;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  // New warga functions using warga_new table
  const fetchWarga = async () => {
    const { data, error } = await supabase
      .from('warga_new')
      .select('*')
      .order('blok_rumah', { ascending: true });
    
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

  const fetchArtikelBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('artikel_berita')
      .select('*')
      .eq('slug_url', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error fetching artikel by slug:', error);
      return null;
    }
    
    return data;
  };

  const fetchUMKMBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('umkm')
      .select(`
        *,
        warga_new:warga_id(nama_suami, nama_istri, nomor_hp_suami, nomor_hp_istri)
      `)
      .eq('slug_url', slug)
      .eq('status', 'aktif')
      .single();
    
    if (error) {
      console.error('Error fetching UMKM by slug:', error);
      return null;
    }
    
    return data;
  };

  // Buku Tamu functions - Fixed query
  const fetchBukuTamu = async () => {
    const { data, error } = await supabase
      .from('buku_tamu')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching buku tamu:', error);
      return [];
    }
    
    return data || [];
  };

  const addBukuTamu = async (bukuTamuData: any) => {
    const { data, error } = await supabase
      .from('buku_tamu')
      .insert([bukuTamuData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding buku tamu:', error);
      throw error;
    }
    
    return data;
  };

  const updateBukuTamu = async (id: string, bukuTamuData: any) => {
    const { data, error } = await supabase
      .from('buku_tamu')
      .update(bukuTamuData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating buku tamu:', error);
      throw error;
    }
    
    return data;
  };

  // UMKM functions
  const fetchUMKM = async () => {
    try {
      // First try the full query with joins
      const { data, error } = await supabase
        .from('umkm')
        .select(`
          *,
          warga_new (
            nama_suami,
            nama_istri,
            nomor_hp_suami,
            nomor_hp_istri
          ),
          umkm_tags (
            tag_id,
            tag_umkm (
              id,
              nama_tag,
              warna
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching UMKM with joins:', error);
        
        // Fallback: try simple query without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('umkm')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) {
          console.error('Error fetching UMKM simple:', simpleError);
          return [];
        }
        
        console.log('UMKM data fetched successfully (simple):', simpleData?.length, 'records');
        return simpleData || [];
      }
      
      console.log('UMKM data fetched successfully:', data?.length, 'records');
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching UMKM:', error);
      return [];
    }
  };

  const fetchUMKMPublic = async (tag?: string) => {
    try {
      let query = supabase
        .from('umkm')
        .select(`
          *,
          warga_new (
            nama_suami,
            nama_istri,
            nomor_hp_suami,
            nomor_hp_istri
          ),
          umkm_tags (
            tag_id,
            tag_umkm (
              id,
              nama_tag,
              warna
            )
          )
        `)
        .eq('status', 'aktif')
        .order('created_at', { ascending: false });
      
      // Note: tag filtering will be handled in the frontend since we now use many-to-many relationship
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching public UMKM with joins:', error);
        
        // Fallback: try simple query without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('umkm')
          .select('*')
          .eq('status', 'aktif')
          .order('created_at', { ascending: false });
        
        if (simpleError) {
          console.error('Error fetching public UMKM simple:', simpleError);
          return [];
        }
        
        return simpleData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching public UMKM:', error);
      return [];
    }
  };

  const addUMKM = async (umkmData: any) => {
    const { selectedTags, ...umkmDataWithoutTags } = umkmData;
    
    // Clean up empty strings to NULL for optional fields to satisfy database constraints
    const cleanedData = {
      ...umkmDataWithoutTags,
      email: umkmDataWithoutTags.email?.trim() === '' ? null : umkmDataWithoutTags.email,
      nomor_telepon: umkmDataWithoutTags.nomor_telepon?.trim() === '' ? null : umkmDataWithoutTags.nomor_telepon,
      website: umkmDataWithoutTags.website?.trim() === '' ? null : umkmDataWithoutTags.website
    };
    
    const { data, error } = await supabase
      .from('umkm')
      .insert([cleanedData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding UMKM:', error);
      throw error;
    }
    
    // Add tags if any are selected
    if (selectedTags && selectedTags.length > 0) {
      const tagInserts = selectedTags.map((tagId: string) => ({
        umkm_id: data.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('umkm_tags')
        .insert(tagInserts);
      
      if (tagError) {
        console.error('Error adding UMKM tags:', tagError);
        // Don't throw here, UMKM was created successfully
      }
    }
    
    return data;
  };

  const updateUMKM = async (id: string, umkmData: any) => {
    const { selectedTags, ...umkmDataWithoutTags } = umkmData;
    
    // Clean up empty strings to NULL for optional fields to satisfy database constraints
    const cleanedData = {
      ...umkmDataWithoutTags,
      email: umkmDataWithoutTags.email?.trim() === '' ? null : umkmDataWithoutTags.email,
      nomor_telepon: umkmDataWithoutTags.nomor_telepon?.trim() === '' ? null : umkmDataWithoutTags.nomor_telepon,
      website: umkmDataWithoutTags.website?.trim() === '' ? null : umkmDataWithoutTags.website
    };
    
    const { data, error } = await supabase
      .from('umkm')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating UMKM:', error);
      throw error;
    }
    
    // Update tags if provided
    if (selectedTags !== undefined) {
      // First, delete existing tags
      await supabase
        .from('umkm_tags')
        .delete()
        .eq('umkm_id', id);
      
      // Then add new tags if any are selected
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map((tagId: string) => ({
          umkm_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('umkm_tags')
          .insert(tagInserts);
        
        if (tagError) {
          console.error('Error updating UMKM tags:', tagError);
          // Don't throw here, UMKM was updated successfully
        }
      }
    }
    
    return data;
  };

  const deleteUMKM = async (id: string) => {
    const { error } = await supabase
      .from('umkm')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting UMKM:', error);
      throw error;
    }
  };

  const uploadImageUMKM = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `umkm_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadImageUMKM:', error);
      return null;
    }
  };

  const deleteImageUMKM = async (imageUrl: string): Promise<void> => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `umkm_images/${fileName}`;

      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
      }
    } catch (error) {
      console.error('Error in deleteImageUMKM:', error);
    }
  };

  // Generate signed URL for UMKM images
  const generateSignedUrlUMKM = async (imageUrl: string): Promise<string> => {
    if (!imageUrl) return "";
    
    try {
      // If it's already a public URL, return as is
      if (imageUrl.includes('supabase') && !imageUrl.includes('images')) {
        return imageUrl;
      }
      
      // Extract path from full URL if needed
      let filePath = imageUrl;
      if (imageUrl.includes('umkm_images/')) {
        const pathParts = imageUrl.split('umkm_images/');
        if (pathParts.length > 1) {
          filePath = `umkm_images/${pathParts[1].split('?')[0]}`; // Remove query parameters
        }
      }
      
      // Try to generate signed URL for private bucket first
      const { data, error } = await supabase.storage
        .from('images')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error generating signed URL for UMKM image:', error);
        return imageUrl; // Return original URL as fallback
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL for UMKM image:', error);
      return imageUrl; // Return original URL as fallback
    }
  };

  // Tag UMKM functions
  const fetchTagUMKM = async () => {
    const { data, error } = await supabase
      .from('tag_umkm')
      .select('*')
      .order('nama_tag', { ascending: true });
    
    if (error) {
      console.error('Error fetching tag UMKM:', error);
      return [];
    }
    
    return data || [];
  };

  const addTagUMKM = async (tagData: any) => {
    const { data, error } = await supabase
      .from('tag_umkm')
      .insert([tagData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding tag UMKM:', error);
      throw error;
    }
    
    return data;
  };

  const updateTagUMKM = async (id: string, tagData: any) => {
    const { data, error } = await supabase
      .from('tag_umkm')
      .update(tagData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating tag UMKM:', error);
      throw error;
    }
    
    return data;
  };

  const deleteTagUMKM = async (id: string) => {
    const { error } = await supabase
      .from('tag_umkm')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting tag UMKM:', error);
      throw error;
    }
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
    deleteImageArtikel,
    fetchArtikelBySlug,
    // Buku Tamu functions
    fetchBukuTamu,
    addBukuTamu,
    updateBukuTamu,
    // UMKM functions
    fetchUMKM,
    fetchUMKMPublic,
    fetchUMKMBySlug,
    addUMKM,
    updateUMKM,
    deleteUMKM,
    uploadImageUMKM,
    deleteImageUMKM,
    generateSignedUrlUMKM,
    // Tag UMKM functions
    fetchTagUMKM,
    addTagUMKM,
    updateTagUMKM,
    deleteTagUMKM
  };
};
