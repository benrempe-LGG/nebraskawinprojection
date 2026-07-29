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
      ballots: {
        Row: {
          created_at: string
          draft_payload: Json
          id: string
          locked_at: string | null
          locked_payload: Json | null
          season: number
          status: Database["public"]["Enums"]["ballot_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_payload?: Json
          id?: string
          locked_at?: string | null
          locked_payload?: Json | null
          season: number
          status?: Database["public"]["Enums"]["ballot_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_payload?: Json
          id?: string
          locked_at?: string | null
          locked_payload?: Json | null
          season?: number
          status?: Database["public"]["Enums"]["ballot_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ballots_season_fkey"
            columns: ["season"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["year"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          away_team_id: string
          canonical_key: string | null
          cfbd_game_id: number | null
          completed_at: string | null
          date_label: string | null
          home_score: number | null
          home_team_id: string
          id: string
          kickoff_at: string | null
          neutral_site: boolean
          season: number
          status: Database["public"]["Enums"]["game_status"]
          updated_at: string
          venue: string | null
          week: number
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          canonical_key?: string | null
          cfbd_game_id?: number | null
          completed_at?: string | null
          date_label?: string | null
          home_score?: number | null
          home_team_id: string
          id?: string
          kickoff_at?: string | null
          neutral_site?: boolean
          season: number
          status?: Database["public"]["Enums"]["game_status"]
          updated_at?: string
          venue?: string | null
          week: number
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          canonical_key?: string | null
          cfbd_game_id?: number | null
          completed_at?: string | null
          date_label?: string | null
          home_score?: number | null
          home_team_id?: string
          id?: string
          kickoff_at?: string | null
          neutral_site?: boolean
          season?: number
          status?: Database["public"]["Enums"]["game_status"]
          updated_at?: string
          venue?: string | null
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_season_fkey"
            columns: ["season"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["year"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "prediction_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_groups: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_id: string
          season: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          owner_id: string
          season: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          season?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_groups_season_fkey"
            columns: ["season"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["year"]
          },
        ]
      }
      predictions: {
        Row: {
          ballot_id: string
          created_at: string
          game_id: string
          id: string
          predicted_winner_id: string
          updated_at: string
          win_probability: number | null
        }
        Insert: {
          ballot_id: string
          created_at?: string
          game_id: string
          id?: string
          predicted_winner_id: string
          updated_at?: string
          win_probability?: number | null
        }
        Update: {
          ballot_id?: string
          created_at?: string
          game_id?: string
          id?: string
          predicted_winner_id?: string
          updated_at?: string
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_ballot_id_fkey"
            columns: ["ballot_id"]
            isOneToOne: false
            referencedRelation: "ballots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_ballot_id_fkey"
            columns: ["ballot_id"]
            isOneToOne: false
            referencedRelation: "weekly_scorecards"
            referencedColumns: ["ballot_id"]
          },
          {
            foreignKeyName: "predictions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_predicted_winner_id_fkey"
            columns: ["predicted_winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          favorite_team: string | null
          id: string
          is_public: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          favorite_team?: string | null
          id: string
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          favorite_team?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          ballot_deadline: string | null
          created_at: string
          is_active: boolean
          name: string
          year: number
        }
        Insert: {
          ballot_deadline?: string | null
          created_at?: string
          is_active?: boolean
          name: string
          year: number
        }
        Update: {
          ballot_deadline?: string | null
          created_at?: string
          is_active?: boolean
          name?: string
          year?: number
        }
        Relationships: []
      }
      teams: {
        Row: {
          cfbd_team: string | null
          conference: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          cfbd_team?: string | null
          conference?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          cfbd_team?: string | null
          conference?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      group_leaderboard: {
        Row: {
          accuracy: number | null
          correct_picks: number | null
          display_name: string | null
          games_final: number | null
          group_id: string | null
          role: Database["public"]["Enums"]["group_role"] | null
          user_id: string | null
          weeks_scored: number | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "prediction_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_scorecards: {
        Row: {
          ballot_id: string | null
          confidence_games: number | null
          confidence_score: number | null
          correct_picks: number | null
          games_final: number | null
          incorrect_picks: number | null
          season: number | null
          user_id: string | null
          week: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ballots_season_fkey"
            columns: ["season"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["year"]
          },
        ]
      }
    }
    Functions: {
      create_private_group: {
        Args: { group_name: string; target_season?: number }
        Returns: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_id: string
          season: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "prediction_groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_group_leaderboard: {
        Args: { target_group: string }
        Returns: {
          accuracy: number
          confidence_games: number
          confidence_score: number
          correct_picks: number
          display_name: string
          games_final: number
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
          weeks_scored: number
        }[]
      }
      is_group_member: {
        Args: { target_group: string; target_user?: string }
        Returns: boolean
      }
      join_private_group: {
        Args: { code: string }
        Returns: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_id: string
          season: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "prediction_groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      lock_ballot: {
        Args: { target_ballot: string }
        Returns: {
          created_at: string
          draft_payload: Json
          id: string
          locked_at: string | null
          locked_payload: Json | null
          season: number
          status: Database["public"]["Enums"]["ballot_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ballots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      lock_due_entries: { Args: never; Returns: number }
      regenerate_group_invite: {
        Args: { target_group: string }
        Returns: string
      }
      reopen_entry: {
        Args: { target_season?: number }
        Returns: {
          created_at: string
          draft_payload: Json
          id: string
          locked_at: string | null
          locked_payload: Json | null
          season: number
          status: Database["public"]["Enums"]["ballot_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ballots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_entry_draft: {
        Args: { payload: Json; target_season?: number }
        Returns: {
          created_at: string
          draft_payload: Json
          id: string
          locked_at: string | null
          locked_payload: Json | null
          season: number
          status: Database["public"]["Enums"]["ballot_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ballots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_entry: {
        Args: { expected_games: number; payload: Json; target_season?: number }
        Returns: {
          created_at: string
          draft_payload: Json
          id: string
          locked_at: string | null
          locked_payload: Json | null
          season: number
          status: Database["public"]["Enums"]["ballot_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ballots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_2026_catalog: { Args: { catalog: Json }; Returns: number }
    }
    Enums: {
      ballot_status: "draft" | "submitted" | "locked"
      game_status:
        | "scheduled"
        | "in_progress"
        | "final"
        | "postponed"
        | "canceled"
      group_role: "owner" | "member"
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
      ballot_status: ["draft", "submitted", "locked"],
      game_status: [
        "scheduled",
        "in_progress",
        "final",
        "postponed",
        "canceled",
      ],
      group_role: ["owner", "member"],
    },
  },
} as const
