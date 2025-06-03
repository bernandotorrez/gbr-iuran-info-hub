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
      contribution_types: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_recurring: boolean
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          due_date: string
          id: string
          message: string
          reminder_type: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          message: string
          reminder_type: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          message?: string
          reminder_type?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_schedules: {
        Row: {
          amount: number
          contribution_type_id: string
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contribution_type_id: string
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contribution_type_id?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          days_before: number
          id: string
          is_active: boolean
          message_template: string
          reminder_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_before: number
          id?: string
          is_active?: boolean
          message_template: string
          reminder_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_before?: number
          id?: string
          is_active?: boolean
          message_template?: string
          reminder_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          created_at: string
          house_block: string
          house_number: string
          id: string
          is_active: boolean
          name: string
          phone_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          house_block: string
          house_number: string
          id?: string
          is_active?: boolean
          name: string
          phone_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          house_block?: string
          house_number?: string
          id?: string
          is_active?: boolean
          name?: string
          phone_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          resident_id: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          resident_id: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          resident_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: true
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_monthly_payment_schedules: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_payment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_overdue_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
