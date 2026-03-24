export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'citizen' | 'notary'
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'citizen' | 'notary'
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'citizen' | 'notary'
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bonds: {
        Row: {
          id: string
          user_id: string
          doc_type: string
          // Stateless Identity Protocol: NO party_details, NO id_number
          legal_name: string | null
          legal_address: string | null
          content: string | null
          xai_summary: string | null
          status: 'draft' | 'verified' | 'printed'
          health_score: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          doc_type: string
          legal_name?: string | null
          legal_address?: string | null
          content?: string | null
          xai_summary?: string | null
          status?: 'draft' | 'verified' | 'printed'
          health_score?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          doc_type?: string
          legal_name?: string | null
          legal_address?: string | null
          content?: string | null
          xai_summary?: string | null
          status?: 'draft' | 'verified' | 'printed'
          health_score?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      temp_session_data: {
        Row: {
          session_id: string
          legal_name: string | null
          legal_address: string | null
          doc_type: string | null
          expires_at: string
        }
        Insert: {
          session_id?: string
          legal_name?: string | null
          legal_address?: string | null
          doc_type?: string | null
          expires_at: string
        }
        Update: {
          session_id?: string
          legal_name?: string | null
          legal_address?: string | null
          doc_type?: string | null
          expires_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      notary_queue: {
        Row: {
          id: string
          user_id: string
          doc_type: string
          legal_name: string | null
          legal_address: string | null
          content: string | null
          xai_summary: string | null
          status: 'draft' | 'verified' | 'printed'
          health_score: number | null
          created_at: string | null
          citizen_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
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
