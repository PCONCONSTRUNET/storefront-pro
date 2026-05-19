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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          category: string
          created_at: string
          description: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      admin_credentials: {
        Row: {
          created_at: string
          email: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          token?: string
        }
        Relationships: []
      }
      affiliate_consignments: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          notes: string | null
          picked_up_at: string
          quantity: number
          total_value: number
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          picked_up_at?: string
          quantity?: number
          total_value?: number
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          picked_up_at?: string
          quantity?: number
          total_value?: number
        }
        Relationships: []
      }
      affiliate_credentials: {
        Row: {
          affiliate_id: string
          created_at: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_credentials_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_sales: {
        Row: {
          affiliate_id: string
          commission_earned: number
          created_at: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          product_description: string
          sale_value: number
          status: string
        }
        Insert: {
          affiliate_id: string
          commission_earned?: number
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          product_description: string
          sale_value?: number
          status?: string
        }
        Update: {
          affiliate_id?: string
          commission_earned?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          product_description?: string
          sale_value?: number
          status?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          active: boolean
          commission_type: string
          commission_value: number
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          commission_type?: string
          commission_value?: number
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          commission_type?: string
          commission_value?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id: string
          image?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          extra: Json
          kind: string
          min_subtotal: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          extra?: Json
          kind?: string
          min_subtotal?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          extra?: Json
          kind?: string
          min_subtotal?: number
          value?: number
        }
        Relationships: []
      }
      customer_credentials: {
        Row: {
          created_at: string
          customer_id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_credentials_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          addresses: Json
          created_at: string
          email: string
          favorites: Json
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          addresses?: Json
          created_at?: string
          email: string
          favorites?: Json
          id?: string
          name: string
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          addresses?: Json
          created_at?: string
          email?: string
          favorites?: Json
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customer_document: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          daily_summary_id: string | null
          delivery_method: string
          discount: number
          id: string
          items: Json
          mp_payment_id: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          pix_expires_at: string | null
          pix_qr_code: string | null
          pix_qr_code_base64: string | null
          reminder_sent_at: string | null
          shipping: number
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_document?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          daily_summary_id?: string | null
          delivery_method?: string
          discount?: number
          id?: string
          items?: Json
          mp_payment_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          reminder_sent_at?: string | null
          shipping?: number
          subtotal?: number
          total: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_document?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          daily_summary_id?: string | null
          delivery_method?: string
          discount?: number
          id?: string
          items?: Json
          mp_payment_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          reminder_sent_at?: string | null
          shipping?: number
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          subject_email: string
          subject_type: Database["public"]["Enums"]["reset_subject"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          subject_email: string
          subject_type: Database["public"]["Enums"]["reset_subject"]
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          subject_email?: string
          subject_type?: Database["public"]["Enums"]["reset_subject"]
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          event_type: string
          id: string
          mp_event_id: string
          mp_payment_id: string | null
          order_id: string | null
          processed_at: string
          raw_payload: Json
        }
        Insert: {
          event_type: string
          id?: string
          mp_event_id: string
          mp_payment_id?: string | null
          order_id?: string | null
          processed_at?: string
          raw_payload: Json
        }
        Update: {
          event_type?: string
          id?: string
          mp_event_id?: string
          mp_payment_id?: string | null
          order_id?: string | null
          processed_at?: string
          raw_payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway: {
        Row: {
          environment: string
          id: number
          installment_fees: Json
          max_installments: number
          mp_access_token: string | null
          mp_public_key: string | null
          updated_at: string
        }
        Insert: {
          environment?: string
          id?: number
          installment_fees?: Json
          max_installments?: number
          mp_access_token?: string | null
          mp_public_key?: string | null
          updated_at?: string
        }
        Update: {
          environment?: string
          id?: number
          installment_fees?: Json
          max_installments?: number
          mp_access_token?: string | null
          mp_public_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_waitlist: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          id: string
          notified: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          id?: string
          notified?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          notified?: boolean
          product_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          description: string | null
          extra: Json
          featured: boolean
          id: string
          images: Json
          name: string
          original_price: number | null
          price: number
          slug: string | null
          stock: number
          updated_at: string
          variations: Json
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          extra?: Json
          featured?: boolean
          id: string
          images?: Json
          name: string
          original_price?: number | null
          price?: number
          slug?: string | null
          stock?: number
          updated_at?: string
          variations?: Json
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          extra?: Json
          featured?: boolean
          id?: string
          images?: Json
          name?: string
          original_price?: number | null
          price?: number
          slug?: string | null
          stock?: number
          updated_at?: string
          variations?: Json
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          id: string
          photos: Json
          product_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          id?: string
          photos?: Json
          product_id: string
          rating?: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          photos?: Json
          product_id?: string
          rating?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          data: Json
          id: number
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          affiliate_id: string | null
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          kind: string
          notes: string | null
          product_summary: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount?: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          kind: string
          notes?: string | null
          product_summary?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          kind?: string
          notes?: string | null
          product_summary?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_password_reset_token: {
        Args: { _token: string }
        Returns: {
          subject_email: string
          subject_type: Database["public"]["Enums"]["reset_subject"]
        }[]
      }
      create_admin_session: {
        Args: { _email: string; _token: string }
        Returns: undefined
      }
      create_customer_with_password_hash: {
        Args: {
          _address: string
          _email: string
          _name: string
          _password_hash: string
          _phone: string
        }
        Returns: {
          address: string
          addresses: Json
          created_at: string
          email: string
          favorites: Json
          id: string
          message: string
          name: string
          ok: boolean
          phone: string
        }[]
      }
      delete_admin_session: { Args: { _token: string }; Returns: undefined }
      get_admin_auth_record: {
        Args: { _email: string }
        Returns: {
          email: string
          password_hash: string
        }[]
      }
      get_admin_session_record: {
        Args: { _token: string }
        Returns: {
          email: string
          expires_at: string
        }[]
      }
      get_customer_auth_record: {
        Args: { _email: string }
        Returns: {
          address: string
          addresses: Json
          created_at: string
          email: string
          favorites: Json
          id: string
          name: string
          password_hash: string
          phone: string
        }[]
      }
      get_payment_gateway: {
        Args: never
        Returns: {
          environment: string
          installment_fees: Json
          max_installments: number
          mp_access_token: string
          mp_public_key: string
        }[]
      }
      get_payment_installment_config: {
        Args: never
        Returns: {
          installment_fees: Json
          max_installments: number
        }[]
      }
      get_payment_public_key: { Args: never; Returns: string }
      get_pix_order_status: {
        Args: { _id: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          pix_expires_at: string
          pix_qr_code: string
          pix_qr_code_base64: string
          total: number
        }[]
      }
      save_payment_gateway: {
        Args: {
          _environment: string
          _installment_fees: Json
          _max_installments: number
          _mp_access_token: string
          _mp_public_key: string
        }
        Returns: undefined
      }
      update_customer_password_hash: {
        Args: { _customer_id: string; _password_hash: string }
        Returns: {
          message: string
          ok: boolean
        }[]
      }
    }
    Enums: {
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded"
        | "expired"
      reset_subject: "admin" | "customer" | "affiliate"
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
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "refunded",
        "expired",
      ],
      reset_subject: ["admin", "customer", "affiliate"],
    },
  },
} as const
