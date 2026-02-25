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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cars: {
        Row: {
          body_type: string
          brand: string
          created_at: string
          description: string | null
          fuel_type: string
          id: string
          image_url: string | null
          is_active: boolean
          model: string
          updated_at: string
          year: number
        }
        Insert: {
          body_type?: string
          brand: string
          created_at?: string
          description?: string | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          model: string
          updated_at?: string
          year: number
        }
        Update: {
          body_type?: string
          brand?: string
          created_at?: string
          description?: string | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          model?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      city_pricing: {
        Row: {
          city: string
          id: string
          insurance_cost: number | null
          on_road_price: number
          other_charges: number | null
          registration_cost: number | null
          road_tax: number | null
          variant_id: string
        }
        Insert: {
          city: string
          id?: string
          insurance_cost?: number | null
          on_road_price: number
          other_charges?: number | null
          registration_cost?: number | null
          road_tax?: number | null
          variant_id: string
        }
        Update: {
          city?: string
          id?: string
          insurance_cost?: number | null
          on_road_price?: number
          other_charges?: number | null
          registration_cost?: number | null
          road_tax?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_pricing_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      depreciation_models: {
        Row: {
          car_id: string
          depreciation_pct: number
          id: string
          resale_value_pct: number
          year_number: number
        }
        Insert: {
          car_id: string
          depreciation_pct: number
          id?: string
          resale_value_pct: number
          year_number: number
        }
        Update: {
          car_id?: string
          depreciation_pct?: number
          id?: string
          resale_value_pct?: number
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_models_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          insurance_impact: string | null
          name: string
          plain_explanation: string | null
          practicality_score: number | null
          repair_risk: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          insurance_impact?: string | null
          name: string
          plain_explanation?: string | null
          practicality_score?: number | null
          repair_risk?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          insurance_impact?: string | null
          name?: string
          plain_explanation?: string | null
          practicality_score?: number | null
          repair_risk?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          city: string | null
          created_at: string
          daily_usage_km: number | null
          driving_style: string | null
          family_size: number | null
          future_plans: string | null
          highway_pct: number | null
          id: string
          ownership_years: number | null
          tech_preference: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          daily_usage_km?: number | null
          driving_style?: string | null
          family_size?: number | null
          future_plans?: string | null
          highway_pct?: number | null
          id?: string
          ownership_years?: number | null
          tech_preference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          daily_usage_km?: number | null
          driving_style?: string | null
          family_size?: number | null
          future_plans?: string | null
          highway_pct?: number | null
          id?: string
          ownership_years?: number | null
          tech_preference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_features: {
        Row: {
          feature_id: string
          id: string
          incremental_cost: number | null
          resale_impact: string | null
          usefulness_score: number | null
          variant_id: string
        }
        Insert: {
          feature_id: string
          id?: string
          incremental_cost?: number | null
          resale_impact?: string | null
          usefulness_score?: number | null
          variant_id: string
        }
        Update: {
          feature_id?: string
          id?: string
          incremental_cost?: number | null
          resale_impact?: string | null
          usefulness_score?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_features_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          car_id: string
          created_at: string
          engine_cc: number | null
          ex_showroom_price: number
          fuel_tank_liters: number | null
          horsepower: number | null
          id: string
          insurance_cost_yearly: number | null
          mileage_kmpl: number | null
          name: string
          registration_cost: number | null
          road_tax: number | null
          safety_rating: number | null
          torque_nm: number | null
          transmission: string | null
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          engine_cc?: number | null
          ex_showroom_price: number
          fuel_tank_liters?: number | null
          horsepower?: number | null
          id?: string
          insurance_cost_yearly?: number | null
          mileage_kmpl?: number | null
          name: string
          registration_cost?: number | null
          road_tax?: number | null
          safety_rating?: number | null
          torque_nm?: number | null
          transmission?: string | null
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          engine_cc?: number | null
          ex_showroom_price?: number
          fuel_tank_liters?: number | null
          horsepower?: number | null
          id?: string
          insurance_cost_yearly?: number | null
          mileage_kmpl?: number | null
          name?: string
          registration_cost?: number | null
          road_tax?: number | null
          safety_rating?: number | null
          torque_nm?: number | null
          transmission?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
