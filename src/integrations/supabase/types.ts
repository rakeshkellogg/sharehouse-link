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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      listings: {
        Row: {
          bathrooms: string | null
          bedrooms: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          district: string | null
          google_maps_link: string | null
          id: string
          is_public: boolean
          latitude: number | null
          location_address: string | null
          longitude: number | null
          media_links: string[]
          owner_name: string
          owner_phone: string | null
          owner_whatsapp: string | null
          pincode: string | null
          place_id: string | null
          price: number
          price_amount_raw: number | null
          price_rupees: number | null
          price_unit: string | null
          property_type: string | null
          size: string | null
          size_amount_raw: number | null
          size_scale: string | null
          size_unit: string | null
          size_value_canonical: number | null
          state: string | null
          sub_area: string | null
          sub_area_slug: string | null
          title: string
          transaction_type: string | null
          updated_at: string
          user_id: string
          youtube_url: string | null
        }
        Insert: {
          bathrooms?: string | null
          bedrooms?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          district?: string | null
          google_maps_link?: string | null
          id?: string
          is_public?: boolean
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          media_links?: string[]
          owner_name: string
          owner_phone?: string | null
          owner_whatsapp?: string | null
          pincode?: string | null
          place_id?: string | null
          price: number
          price_amount_raw?: number | null
          price_rupees?: number | null
          price_unit?: string | null
          property_type?: string | null
          size?: string | null
          size_amount_raw?: number | null
          size_scale?: string | null
          size_unit?: string | null
          size_value_canonical?: number | null
          state?: string | null
          sub_area?: string | null
          sub_area_slug?: string | null
          title: string
          transaction_type?: string | null
          updated_at?: string
          user_id: string
          youtube_url?: string | null
        }
        Update: {
          bathrooms?: string | null
          bedrooms?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          district?: string | null
          google_maps_link?: string | null
          id?: string
          is_public?: boolean
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          media_links?: string[]
          owner_name?: string
          owner_phone?: string | null
          owner_whatsapp?: string | null
          pincode?: string | null
          place_id?: string | null
          price?: number
          price_amount_raw?: number | null
          price_rupees?: number | null
          price_unit?: string | null
          property_type?: string | null
          size?: string | null
          size_amount_raw?: number | null
          size_scale?: string | null
          size_unit?: string | null
          size_value_canonical?: number | null
          state?: string | null
          sub_area?: string | null
          sub_area_slug?: string | null
          title?: string
          transaction_type?: string | null
          updated_at?: string
          user_id?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          listing_id: string
          owner_user_id: string
          read_at: string | null
          sender_user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          listing_id: string
          owner_user_id: string
          read_at?: string | null
          sender_user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          listing_id?: string
          owner_user_id?: string
          read_at?: string | null
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      pincode_cache: {
        Row: {
          city: string
          lat: number | null
          lng: number | null
          pincode: string
          state: string
          updated_at: string
        }
        Insert: {
          city: string
          lat?: number | null
          lng?: number | null
          pincode: string
          state: string
          updated_at?: string
        }
        Update: {
          city?: string
          lat?: number | null
          lng?: number | null
          pincode?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          id: string
          listing_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          listing_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          listing_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
