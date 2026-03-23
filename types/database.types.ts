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
      themes: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          description: string | null
          text: string | null
          mainImg: string | null
          heroImg: string | null
          thumbImg: string | null
          likes: number
          visible: boolean
          order: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          description?: string | null
          text?: string | null
          mainImg?: string | null
          heroImg?: string | null
          thumbImg?: string | null
          likes?: number
          visible?: boolean
          order?: number
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          description?: string | null
          text?: string | null
          mainImg?: string | null
          heroImg?: string | null
          thumbImg?: string | null
          likes?: number
          visible?: boolean
          order?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          photo: string | null
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          photo?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          photo?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: number
          user_id: string
          theme_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          theme_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          theme_id?: number
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      vote_theme: {
        Args: { p_theme_id: number }
        Returns: void
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
    }
  }
}
