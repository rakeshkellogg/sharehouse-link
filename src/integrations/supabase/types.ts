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
      admin_emails: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
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
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          suspended_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          suspended_at?: string | null
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      public_listings: {
        Row: {
          bathrooms: string | null
          bedrooms: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          district: string | null
          google_maps_link: string | null
          id: string | null
          is_public: boolean | null
          latitude: number | null
          location_address: string | null
          longitude: number | null
          media_links: string[] | null
          pincode: string | null
          place_id: string | null
          price: number | null
          price_amount_raw: number | null
          price_rupees: number | null
          price_unit: string | null
          property_type: string | null
          size: string | null
          size_scale: string | null
          size_unit: string | null
          size_value_canonical: number | null
          state: string | null
          sub_area: string | null
          sub_area_slug: string | null
          title: string | null
          transaction_type: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          bathrooms?: string | null
          bedrooms?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          google_maps_link?: string | null
          id?: string | null
          is_public?: boolean | null
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          media_links?: string[] | null
          pincode?: string | null
          place_id?: string | null
          price?: number | null
          price_amount_raw?: number | null
          price_rupees?: number | null
          price_unit?: string | null
          property_type?: string | null
          size?: string | null
          size_scale?: string | null
          size_unit?: string | null
          size_value_canonical?: number | null
          state?: string | null
          sub_area?: string | null
          sub_area_slug?: string | null
          title?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          bathrooms?: string | null
          bedrooms?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          google_maps_link?: string | null
          id?: string | null
          is_public?: boolean | null
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          media_links?: string[] | null
          pincode?: string | null
          place_id?: string | null
          price?: number | null
          price_amount_raw?: number | null
          price_rupees?: number | null
          price_unit?: string | null
          property_type?: string | null
          size?: string | null
          size_scale?: string | null
          size_unit?: string | null
          size_value_canonical?: number | null
          state?: string | null
          sub_area?: string | null
          sub_area_slug?: string | null
          title?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_set_listing: {
        Args: {
          p_is_public?: boolean
          p_listing_id: string
          p_soft_delete?: boolean
        }
        Returns: undefined
      }
      admin_set_user_suspension: {
        Args: { p_suspend: boolean; p_user_id: string }
        Returns: undefined
      }
      can_send_message_today: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_public_listing: {
        Args: { listing_id: string }
        Returns: {
          bathrooms: string
          bedrooms: string
          city: string
          cover_image_url: string
          created_at: string
          description: string
          district: string
          google_maps_link: string
          id: string
          is_public: boolean
          latitude: number
          location_address: string
          longitude: number
          media_links: string[]
          pincode: string
          price: number
          price_rupees: number
          price_unit: string
          property_type: string
          size: string
          size_unit: string
          state: string
          sub_area: string
          title: string
          transaction_type: string
          youtube_url: string
        }[]
      }
      get_remaining_messages_today: {
        Args: { recipient_id: string; sender_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_suspended: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      read_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      search_public_listings: {
        Args: { search_location?: string }
        Returns: {
          city: string
          district: string
          id: string
          location_address: string
          state: string
          sub_area: string
          title: string
        }[]
      }
      user_can_see_contact_info: {
        Args: { listing_id: string }
        Returns: boolean
      }
      write_setting: {
        Args: { k: string; v: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "moderator" | "user"
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
      app_role: ["super_admin", "moderator", "user"],
    },
  },
} as const
