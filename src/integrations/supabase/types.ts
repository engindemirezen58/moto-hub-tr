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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      courier_applications: {
        Row: {
          created_at: string
          experience: string | null
          id: string
          job_id: string
          license_class: string | null
          message: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience?: string | null
          id?: string
          job_id: string
          license_class?: string | null
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience?: string | null
          id?: string
          job_id?: string
          license_class?: string | null
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "courier_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_jobs: {
        Row: {
          city: string
          company_name: string
          created_at: string
          description: string | null
          district: string | null
          id: string
          region: string | null
          requirements: string | null
          requires_own_bike: boolean
          salary_max: number | null
          salary_min: number | null
          shift_hours: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          user_id: string | null
          work_type: Database["public"]["Enums"]["work_type"]
        }
        Insert: {
          city: string
          company_name: string
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          region?: string | null
          requirements?: string | null
          requires_own_bike?: boolean
          salary_max?: number | null
          salary_min?: number | null
          shift_hours?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          user_id?: string | null
          work_type?: Database["public"]["Enums"]["work_type"]
        }
        Update: {
          city?: string
          company_name?: string
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          region?: string | null
          requirements?: string | null
          requires_own_bike?: boolean
          salary_max?: number | null
          salary_min?: number | null
          shift_hours?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          user_id?: string | null
          work_type?: Database["public"]["Enums"]["work_type"]
        }
        Relationships: []
      }
      dealer_profiles: {
        Row: {
          about: string | null
          address: string | null
          business_name: string
          city: string | null
          created_at: string
          district: string | null
          id: string
          is_verified: boolean
          logo_url: string | null
          phone: string | null
          slug: string
          tax_number: string | null
          updated_at: string
          user_id: string
          working_hours: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          business_name: string
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          phone?: string | null
          slug: string
          tax_number?: string | null
          updated_at?: string
          user_id: string
          working_hours?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          business_name?: string
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          phone?: string | null
          slug?: string
          tax_number?: string | null
          updated_at?: string
          user_id?: string
          working_hours?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          listing_type?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          listing_id: string | null
          listing_type: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          listing_id?: string | null
          listing_type?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          listing_id?: string | null
          listing_type?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      motorcycle_listings: {
        Row: {
          brand: string
          city: string
          color: string | null
          created_at: string
          description: string | null
          district: string | null
          engine_cc: number
          engine_type: string | null
          fuel_type: string
          has_damage_record: boolean
          id: string
          is_featured: boolean
          is_new: boolean
          mileage: number
          model: string
          photos: string[]
          price: number
          seller_type: Database["public"]["Enums"]["seller_type"]
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          trade_possible: boolean
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at: string
          user_id: string | null
          view_count: number
          year: number
        }
        Insert: {
          brand: string
          city: string
          color?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          engine_cc: number
          engine_type?: string | null
          fuel_type?: string
          has_damage_record?: boolean
          id?: string
          is_featured?: boolean
          is_new?: boolean
          mileage?: number
          model: string
          photos?: string[]
          price: number
          seller_type?: Database["public"]["Enums"]["seller_type"]
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          trade_possible?: boolean
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          user_id?: string | null
          view_count?: number
          year: number
        }
        Update: {
          brand?: string
          city?: string
          color?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          engine_cc?: number
          engine_type?: string | null
          fuel_type?: string
          has_damage_record?: boolean
          id?: string
          is_featured?: boolean
          is_new?: boolean
          mileage?: number
          model?: string
          photos?: string[]
          price?: number
          seller_type?: Database["public"]["Enums"]["seller_type"]
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          trade_possible?: boolean
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          user_id?: string | null
          view_count?: number
          year?: number
        }
        Relationships: []
      }
      part_listings: {
        Row: {
          brand: string | null
          category: string
          city: string
          compatible_models: string[]
          condition: Database["public"]["Enums"]["condition_type"]
          created_at: string
          description: string | null
          district: string | null
          id: string
          is_featured: boolean
          photos: string[]
          price: number
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          subcategory: string | null
          title: string
          updated_at: string
          user_id: string | null
          view_count: number
        }
        Insert: {
          brand?: string | null
          category: string
          city: string
          compatible_models?: string[]
          condition?: Database["public"]["Enums"]["condition_type"]
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          is_featured?: boolean
          photos?: string[]
          price: number
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
        }
        Update: {
          brand?: string | null
          category?: string
          city?: string
          compatible_models?: string[]
          condition?: Database["public"]["Enums"]["condition_type"]
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          is_featured?: boolean
          photos?: string[]
          price?: number
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      repair_shops: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          district: string | null
          google_place_id: string | null
          id: string
          lat: number
          lng: number
          name: string
          phone: string | null
          rating: number | null
          service_types: string[]
          source: string
          updated_at: string
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          google_place_id?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          phone?: string | null
          rating?: number | null
          service_types?: string[]
          source?: string
          updated_at?: string
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          google_place_id?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          phone?: string | null
          rating?: number | null
          service_types?: string[]
          source?: string
          updated_at?: string
          working_hours?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          listing_id: string
          listing_type: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          listing_id: string
          listing_type: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          listing_id?: string
          listing_type?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "bireysel" | "magaza" | "admin"
      application_status: "beklemede" | "gorusuluyor" | "reddedildi" | "kabul"
      condition_type: "sifir" | "kullanilmis" | "yenilenmis"
      listing_status: "beklemede" | "onayli" | "reddedildi" | "satildi"
      seller_type: "sahibinden" | "galeriden" | "yetkili_bayi"
      transmission_type: "manuel" | "otomatik" | "yari_otomatik"
      work_type: "tam_zamanli" | "yari_zamanli" | "gunluk"
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
      app_role: ["bireysel", "magaza", "admin"],
      application_status: ["beklemede", "gorusuluyor", "reddedildi", "kabul"],
      condition_type: ["sifir", "kullanilmis", "yenilenmis"],
      listing_status: ["beklemede", "onayli", "reddedildi", "satildi"],
      seller_type: ["sahibinden", "galeriden", "yetkili_bayi"],
      transmission_type: ["manuel", "otomatik", "yari_otomatik"],
      work_type: ["tam_zamanli", "yari_zamanli", "gunluk"],
    },
  },
} as const
