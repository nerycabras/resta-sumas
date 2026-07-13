export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      achievement: {
        Row: {
          child_id: string
          code: string
          earned_at: string
          id: string
        }
        Insert: {
          child_id: string
          code: string
          earned_at?: string
          id?: string
        }
        Update: {
          child_id?: string
          code?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt: {
        Row: {
          created_at: string
          error_type: string | null
          exercise_json: Json
          given_answer: Json | null
          id: string
          is_correct: boolean
          ms_taken: number | null
          session_id: string
        }
        Insert: {
          created_at?: string
          error_type?: string | null
          exercise_json: Json
          given_answer?: Json | null
          id?: string
          is_correct: boolean
          ms_taken?: number | null
          session_id: string
        }
        Update: {
          created_at?: string
          error_type?: string | null
          exercise_json?: Json
          given_answer?: Json | null
          id?: string
          is_correct?: boolean
          ms_taken?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session"
            referencedColumns: ["id"]
          },
        ]
      }
      block: {
        Row: {
          code: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          code: string
          id?: string
          order_index: number
          title: string
        }
        Update: {
          code?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      child: {
        Row: {
          adult_id: string
          avatar: string
          birth_year: number | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          adult_id?: string
          avatar?: string
          birth_year?: number | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          adult_id?: string
          avatar?: string
          birth_year?: number | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      child_progress: {
        Row: {
          accuracy: number
          block_id: string
          child_id: string
          id: string
          mastered_at: string | null
          sessions_done: number
          status: string
        }
        Insert: {
          accuracy?: number
          block_id: string
          child_id: string
          id?: string
          mastered_at?: string | null
          sessions_done?: number
          status?: string
        }
        Update: {
          accuracy?: number
          block_id?: string
          child_id?: string
          id?: string
          mastered_at?: string | null
          sessions_done?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_progress_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
        ]
      }
      reward: {
        Row: {
          child_id: string
          gems_total: number
          last_played_on: string | null
          streak_days: number
          updated_at: string
        }
        Insert: {
          child_id: string
          gems_total?: number
          last_played_on?: string | null
          streak_days?: number
          updated_at?: string
        }
        Update: {
          child_id?: string
          gems_total?: number
          last_played_on?: string | null
          streak_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          block_id: string | null
          child_id: string
          ended_at: string | null
          gems_earned: number
          id: string
          mode: string
          started_at: string
        }
        Insert: {
          block_id?: string | null
          child_id: string
          ended_at?: string | null
          gems_earned?: number
          id?: string
          mode?: string
          started_at?: string
        }
        Update: {
          block_id?: string | null
          child_id?: string
          ended_at?: string | null
          gems_earned?: number
          id?: string
          mode?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          child_id: string
          config_json: Json
          id: string
          updated_at: string
        }
        Insert: {
          child_id: string
          config_json?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          config_json?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_child: { Args: { cid: string }; Returns: boolean }
      owns_session: { Args: { sid: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

