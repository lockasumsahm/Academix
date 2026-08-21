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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_message_at: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          last_message_at?: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_message_at?: string
          topic?: string | null
        }
        Relationships: []
      }
      entry_bookmarks: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_bookmarks_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "profile_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_comments: {
        Row: {
          body: string
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_comments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "profile_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_likes: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_likes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "profile_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          category: string
          country: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          eligibility: string | null
          fully_funded: boolean
          funding: string | null
          id: string
          mode: string | null
          official_link: string | null
          organization: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          fully_funded?: boolean
          funding?: string | null
          id?: string
          mode?: string | null
          official_link?: string | null
          organization: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          fully_funded?: boolean
          funding?: string | null
          id?: string
          mode?: string | null
          official_link?: string | null
          organization?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          attachment_kind: string | null
          attachment_label: string | null
          attachment_meta: string | null
          author_id: string
          body: string
          comment_count: number
          created_at: string
          id: string
          tags: string[]
          title: string | null
          type: string
          updated_at: string
          visibility: string
        }
        Insert: {
          attachment_kind?: string | null
          attachment_label?: string | null
          attachment_meta?: string | null
          author_id: string
          body: string
          comment_count?: number
          created_at?: string
          id?: string
          tags?: string[]
          title?: string | null
          type?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          attachment_kind?: string | null
          attachment_label?: string | null
          attachment_meta?: string | null
          author_id?: string
          body?: string
          comment_count?: number
          created_at?: string
          id?: string
          tags?: string[]
          title?: string | null
          type?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      professors: {
        Row: {
          accepting_students: boolean | null
          contact_email: string | null
          created_at: string
          department: string
          full_name: string
          id: string
          lab_name: string | null
          profile_link: string | null
          research_areas: string[] | null
          researchgate_link: string | null
          scholar_link: string | null
          university_id: string
          user_id: string | null
        }
        Insert: {
          accepting_students?: boolean | null
          contact_email?: string | null
          created_at?: string
          department: string
          full_name: string
          id?: string
          lab_name?: string | null
          profile_link?: string | null
          research_areas?: string[] | null
          researchgate_link?: string | null
          scholar_link?: string | null
          university_id: string
          user_id?: string | null
        }
        Update: {
          accepting_students?: boolean | null
          contact_email?: string | null
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          lab_name?: string | null
          profile_link?: string | null
          research_areas?: string[] | null
          researchgate_link?: string | null
          scholar_link?: string | null
          university_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professors_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_entries: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          end_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          kind: string
          organization: string | null
          sort_order: number
          start_date: string | null
          title: string
          url: string | null
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          kind: string
          organization?: string | null
          sort_order?: number
          start_date?: string | null
          title: string
          url?: string | null
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          organization?: string | null
          sort_order?: number
          start_date?: string | null
          title?: string
          url?: string | null
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          education_level: string | null
          email: string | null
          full_name: string | null
          github_url: string | null
          graduation_year: number | null
          headline: string | null
          id: string
          languages: string[] | null
          linkedin_url: string | null
          major: string | null
          message_privacy: string
          open_to_collaboration: boolean
          orcid: string | null
          profile_completed: boolean
          research_interests: string[] | null
          scholar_url: string | null
          skills: string[] | null
          university: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          education_level?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          headline?: string | null
          id: string
          languages?: string[] | null
          linkedin_url?: string | null
          major?: string | null
          message_privacy?: string
          open_to_collaboration?: boolean
          orcid?: string | null
          profile_completed?: boolean
          research_interests?: string[] | null
          scholar_url?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          education_level?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          headline?: string | null
          id?: string
          languages?: string[] | null
          linkedin_url?: string | null
          major?: string | null
          message_privacy?: string
          open_to_collaboration?: boolean
          orcid?: string | null
          profile_completed?: boolean
          research_interests?: string[] | null
          scholar_url?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      research_requests: {
        Row: {
          created_at: string
          email_draft: string | null
          id: string
          professor_id: string
          research_summary: string | null
          research_topic: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_draft?: string | null
          id?: string
          professor_id: string
          research_summary?: string | null
          research_topic: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_draft?: string | null
          id?: string
          professor_id?: string
          research_summary?: string | null
          research_topic?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_requests_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professors"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_professors: {
        Row: {
          created_at: string
          id: string
          professor_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          professor_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          professor_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_professors_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professors"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          city: string
          country: string
          created_at: string
          departments: string[] | null
          id: string
          name: string
          ranking: number | null
          website: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          departments?: string[] | null
          id?: string
          name: string
          ranking?: number | null
          website?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          departments?: string[] | null
          id?: string
          name?: string
          ranking?: number | null
          website?: string | null
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "student" | "professor" | "admin"
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
      app_role: ["student", "professor", "admin"],
    },
  },
} as const
