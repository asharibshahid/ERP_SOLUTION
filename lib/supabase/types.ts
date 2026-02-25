export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          client: string;
          department: string;
          contract_amount: string;
          start_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          client: string;
          department: string;
          contract_amount?: string;
          start_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          client?: string;
          department?: string;
          contract_amount?: string;
          start_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scope_changes: {
        Row: {
          id: string;
          workspace_id: string;
          project_id: string;
          date: string;
          added_contract_amount: string;
          added_dev_cost: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          project_id: string;
          date?: string;
          added_contract_amount?: string;
          added_dev_cost?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          project_id?: string;
          date?: string;
          added_contract_amount?: string;
          added_dev_cost?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      people: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          role: string;
          type: string;
          monthly_salary: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          role: string;
          type: string;
          monthly_salary?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          role?: string;
          type?: string;
          monthly_salary?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_costs: {
        Row: {
          id: string;
          workspace_id: string;
          project_id: string;
          cost_type: string;
          person_id: string | null;
          fixed_amount: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          project_id: string;
          cost_type: string;
          person_id?: string | null;
          fixed_amount?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          project_id?: string;
          cost_type?: string;
          person_id?: string | null;
          fixed_amount?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          workspace_id: string;
          date: string;
          type: string;
          project_id: string | null;
          person_id: string | null;
          category: string | null;
          amount: string;
          status: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          date?: string;
          type: string;
          project_id?: string | null;
          person_id?: string | null;
          category?: string | null;
          amount: string;
          status: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          date?: string;
          type?: string;
          project_id?: string | null;
          person_id?: string | null;
          category?: string | null;
          amount?: string;
          status?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          workspace_id: string;
          departments: string[];
          expense_categories: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          departments?: string[];
          expense_categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          departments?: string[];
          expense_categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_workspace_member: {
        Args: {
          target_workspace_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// To regenerate from your live Supabase schema:
// npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > lib/supabase/types.ts
