export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
        }
        Insert: {
          id?: string
          email: string
          role: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
        }
      }
    }
    // Views: {}
    // Functions: {}
    // Enums: {}
  }
}
