export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      artikel_berita: {
        Row: {
          author_id: string
          created_at: string | null
          excerpt: string | null
          gambar_url: string | null
          id: string
          judul: string
          kategori: string | null
          konten: string
          published_at: string | null
          slug_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          excerpt?: string | null
          gambar_url?: string | null
          id?: string
          judul: string
          kategori?: string | null
          konten: string
          published_at?: string | null
          slug_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          excerpt?: string | null
          gambar_url?: string | null
          id?: string
          judul?: string
          kategori?: string | null
          konten?: string
          published_at?: string | null
          slug_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artikel_berita_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
        ]
      }
      buku_tamu: {
        Row: {
          catatan: string | null
          created_at: string | null
          email: string | null
          id: string
          instansi: string | null
          keperluan: string
          ktp_file_url: string | null
          nama_pengunjung: string
          nomor_hp: string | null
          status: string | null
          tanggal_kunjungan: string
          updated_at: string | null
          waktu_keluar: string | null
          waktu_masuk: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instansi?: string | null
          keperluan: string
          ktp_file_url?: string | null
          nama_pengunjung: string
          nomor_hp?: string | null
          status?: string | null
          tanggal_kunjungan?: string
          updated_at?: string | null
          waktu_keluar?: string | null
          waktu_masuk?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instansi?: string | null
          keperluan?: string
          ktp_file_url?: string | null
          nama_pengunjung?: string
          nomor_hp?: string | null
          status?: string | null
          tanggal_kunjungan?: string
          updated_at?: string | null
          waktu_keluar?: string | null
          waktu_masuk?: string | null
        }
        Relationships: []
      }
      iuran: {
        Row: {
          bukti_transfer_url: string | null
          bulan: number
          created_at: string | null
          id: string
          keterangan: string | null
          nominal: number
          status_verifikasi: string | null
          tahun: number
          tanggal_bayar: string
          tipe_iuran_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          warga_id: string
        }
        Insert: {
          bukti_transfer_url?: string | null
          bulan: number
          created_at?: string | null
          id?: string
          keterangan?: string | null
          nominal: number
          status_verifikasi?: string | null
          tahun: number
          tanggal_bayar?: string
          tipe_iuran_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          warga_id: string
        }
        Update: {
          bukti_transfer_url?: string | null
          bulan?: number
          created_at?: string | null
          id?: string
          keterangan?: string | null
          nominal?: number
          status_verifikasi?: string | null
          tahun?: number
          tanggal_bayar?: string
          tipe_iuran_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          warga_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iuran_tipe_iuran_id_fkey"
            columns: ["tipe_iuran_id"]
            isOneToOne: false
            referencedRelation: "tipe_iuran"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iuran_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iuran_warga_id_fkey"
            columns: ["warga_id"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
        ]
      }
      iuran_bulan_ini: {
        Row: {
          count: number | null
        }
        Insert: {
          count?: number | null
        }
        Update: {
          count?: number | null
        }
        Relationships: []
      }
      kas_keluar: {
        Row: {
          bukti_transaksi_url: string | null
          bukti_transfer_url: string | null
          created_at: string | null
          deskripsi: string | null
          diinput_oleh: string
          disetujui_oleh: string | null
          id: string
          judul: string
          kategori: string | null
          nominal: number
          status_persetujuan: string | null
          tanggal_keluar: string
          tanggal_persetujuan: string | null
          tipe_iuran: string | null
          updated_at: string | null
        }
        Insert: {
          bukti_transaksi_url?: string | null
          bukti_transfer_url?: string | null
          created_at?: string | null
          deskripsi?: string | null
          diinput_oleh: string
          disetujui_oleh?: string | null
          id?: string
          judul: string
          kategori?: string | null
          nominal: number
          status_persetujuan?: string | null
          tanggal_keluar?: string
          tanggal_persetujuan?: string | null
          tipe_iuran?: string | null
          updated_at?: string | null
        }
        Update: {
          bukti_transaksi_url?: string | null
          bukti_transfer_url?: string | null
          created_at?: string | null
          deskripsi?: string | null
          diinput_oleh?: string
          disetujui_oleh?: string | null
          id?: string
          judul?: string
          kategori?: string | null
          nominal?: number
          status_persetujuan?: string | null
          tanggal_keluar?: string
          tanggal_persetujuan?: string | null
          tipe_iuran?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kas_keluar_diinput_oleh_fkey"
            columns: ["diinput_oleh"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kas_keluar_disetujui_oleh_fkey"
            columns: ["disetujui_oleh"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
        ]
      }
      kategori_kas_keluar: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          nama: string
          status_aktif: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          nama: string
          status_aktif?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          nama?: string
          status_aktif?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          nama: string
          phone_number: string
          role: string | null
          rt_rw: string | null
          status_aktif: boolean | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nama: string
          phone_number: string
          role?: string | null
          rt_rw?: string | null
          status_aktif?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nama?: string
          phone_number?: string
          role?: string | null
          rt_rw?: string | null
          status_aktif?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      struktur_pengurus: {
        Row: {
          blok_rumah: string | null
          created_at: string
          foto_url: string | null
          id: string
          jabatan: string
          level_jabatan: number
          nama_pengurus: string
          periode_mulai: number
          periode_selesai: number
          status_aktif: boolean
          updated_at: string
          warga_id: string | null
        }
        Insert: {
          blok_rumah?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          jabatan: string
          level_jabatan?: number
          nama_pengurus: string
          periode_mulai: number
          periode_selesai: number
          status_aktif?: boolean
          updated_at?: string
          warga_id?: string | null
        }
        Update: {
          blok_rumah?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          jabatan?: string
          level_jabatan?: number
          nama_pengurus?: string
          periode_mulai?: number
          periode_selesai?: number
          status_aktif?: boolean
          updated_at?: string
          warga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "struktur_pengurus_warga_id_fkey"
            columns: ["warga_id"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_umkm: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          nama_tag: string
          updated_at: string
          warna: string | null
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          nama_tag: string
          updated_at?: string
          warna?: string | null
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          nama_tag?: string
          updated_at?: string
          warna?: string | null
        }
        Relationships: []
      }
      tipe_iuran: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          nama: string
          nominal: number
          status_aktif: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          nama: string
          nominal?: number
          status_aktif?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          nama?: string
          nominal?: number
          status_aktif?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      umkm: {
        Row: {
          alamat: string | null
          created_at: string | null
          deskripsi: string | null
          email: string | null
          gambar_url: string | null
          id: string
          jam_operasional: string | null
          nama_umkm: string
          nomor_telepon: string | null
          phone_source: string | null
          slug_url: string | null
          status: string | null
          tag: string
          updated_at: string | null
          warga_id: string | null
          website: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          deskripsi?: string | null
          email?: string | null
          gambar_url?: string | null
          id?: string
          jam_operasional?: string | null
          nama_umkm: string
          nomor_telepon?: string | null
          phone_source?: string | null
          slug_url?: string | null
          status?: string | null
          tag: string
          updated_at?: string | null
          warga_id?: string | null
          website?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          deskripsi?: string | null
          email?: string | null
          gambar_url?: string | null
          id?: string
          jam_operasional?: string | null
          nama_umkm?: string
          nomor_telepon?: string | null
          phone_source?: string | null
          slug_url?: string | null
          status?: string | null
          tag?: string
          updated_at?: string | null
          warga_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "umkm_warga_id_fkey"
            columns: ["warga_id"]
            isOneToOne: false
            referencedRelation: "warga_new"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_tags: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          umkm_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          umkm_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          umkm_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "umkm_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag_umkm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_tags_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm"
            referencedColumns: ["id"]
          },
        ]
      }
      warga_new: {
        Row: {
          blok_rumah: string
          created_at: string
          id: string
          nama_istri: string | null
          nama_suami: string | null
          nomor_hp_istri: string | null
          nomor_hp_suami: string | null
          role: string | null
          status_aktif: boolean | null
          status_tinggal: Database["public"]["Enums"]["residence_status"]
          updated_at: string
        }
        Insert: {
          blok_rumah: string
          created_at?: string
          id?: string
          nama_istri?: string | null
          nama_suami?: string | null
          nomor_hp_istri?: string | null
          nomor_hp_suami?: string | null
          role?: string | null
          status_aktif?: boolean | null
          status_tinggal?: Database["public"]["Enums"]["residence_status"]
          updated_at?: string
        }
        Update: {
          blok_rumah?: string
          created_at?: string
          id?: string
          nama_istri?: string | null
          nama_suami?: string | null
          nomor_hp_istri?: string | null
          nomor_hp_suami?: string | null
          role?: string | null
          status_aktif?: boolean | null
          status_tinggal?: Database["public"]["Enums"]["residence_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_umkm_with_tags: {
        Args: { tag_ids: string[]; umkm_data: Json }
        Returns: string
      }
      delete_umkm_with_tags: {
        Args: { umkm_id_param: string }
        Returns: boolean
      }
      generate_monthly_report: {
        Args: { target_month: number; target_year: number }
        Returns: Json
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_dashboard_stats_filtered: {
        Args: {
          target_month?: number
          target_tipe_iuran_id?: string
          target_year?: number
        }
        Returns: Json
      }
      get_dashboard_stats_filtered_backup: {
        Args: { target_month?: number; target_year?: number }
        Returns: Json
      }
      get_public_umkm: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          deskripsi: string
          email: string
          gambar_url: string
          id: string
          jam_operasional: string
          nama_umkm: string
          nomor_telepon: string
          slug_url: string
          status: string
          tags: Json
          updated_at: string
          warga_id: string
          warga_name: string
          website: string
        }[]
      }
      get_umkm_by_slug: {
        Args: { slug_param: string }
        Returns: {
          created_at: string
          deskripsi: string
          email: string
          gambar_url: string
          id: string
          jam_operasional: string
          nama_umkm: string
          nomor_telepon: string
          slug_url: string
          status: string
          tags: Json
          updated_at: string
          warga_id: string
          warga_name: string
          website: string
        }[]
      }
      get_umkm_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          deskripsi: string
          email: string
          gambar_url: string
          id: string
          jam_operasional: string
          nama_umkm: string
          nomor_telepon: string
          slug_url: string
          status: string
          tags: Json
          updated_at: string
          warga_id: string
          warga_name: string
          website: string
        }[]
      }
      update_umkm_with_tags: {
        Args: { tag_ids: string[]; umkm_data: Json; umkm_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      residence_status: "Sudah" | "Kadang-Kadang" | "Belum"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      residence_status: ["Sudah", "Kadang-Kadang", "Belum"],
    },
  },
} as const
