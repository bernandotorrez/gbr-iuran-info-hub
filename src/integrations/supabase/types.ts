export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artikel_berita_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      iuran: {
        Row: {
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iuran_warga_id_fkey"
            columns: ["warga_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kas_keluar: {
        Row: {
          bukti_transaksi_url: string | null
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kas_keluar_disetujui_oleh_fkey"
            columns: ["disetujui_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_monthly_report: {
        Args: { target_month: number; target_year: number }
        Returns: Json
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_dashboard_stats_filtered: {
        Args: { target_month?: number; target_year?: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
