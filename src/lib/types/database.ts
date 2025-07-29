export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_tech' | 'finance'
          department: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_tech' | 'finance'
          department?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_tech' | 'finance'
          department?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          patient_id: string
          full_name: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other'
          phone: string
          email: string | null
          address: string
          emergency_contact: string
          emergency_phone: string
          blood_group: string | null
          allergies: string | null
          medical_history: string | null
          status: 'enquiry' | 'registered' | 'admitted' | 'discharged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          full_name: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other'
          phone: string
          email?: string | null
          address: string
          emergency_contact: string
          emergency_phone: string
          blood_group?: string | null
          allergies?: string | null
          medical_history?: string | null
          status?: 'enquiry' | 'registered' | 'admitted' | 'discharged'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          full_name?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other'
          phone?: string
          email?: string | null
          address?: string
          emergency_contact?: string
          emergency_phone?: string
          blood_group?: string | null
          allergies?: string | null
          medical_history?: string | null
          status?: 'enquiry' | 'registered' | 'admitted' | 'discharged'
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          room_number: string
          room_category_id: string
          floor: number
          capacity: number
          current_occupancy: number
          status: 'available' | 'occupied' | 'maintenance' | 'reserved'
          amenities: string[]
          rate_per_day: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_number: string
          room_category_id: string
          floor: number
          capacity: number
          current_occupancy?: number
          status?: 'available' | 'occupied' | 'maintenance' | 'reserved'
          amenities?: string[]
          rate_per_day: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_number?: string
          room_category_id?: string
          floor?: number
          capacity?: number
          current_occupancy?: number
          status?: 'available' | 'occupied' | 'maintenance' | 'reserved'
          amenities?: string[]
          rate_per_day?: number
          created_at?: string
          updated_at?: string
        }
      }
      room_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          base_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_rate: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_rate?: number
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          type: 'consultation' | 'follow_up' | 'emergency' | 'surgery'
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          type: 'consultation' | 'follow_up' | 'emergency' | 'surgery'
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          appointment_time?: string
          type?: 'consultation' | 'follow_up' | 'emergency' | 'surgery'
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admissions: {
        Row: {
          id: string
          patient_id: string
          room_id: string
          doctor_id: string
          admission_date: string
          discharge_date: string | null
          admission_type: 'emergency' | 'planned' | 'transfer'
          diagnosis: string
          treatment_plan: string | null
          status: 'active' | 'discharged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          room_id: string
          doctor_id: string
          admission_date: string
          discharge_date?: string | null
          admission_type: 'emergency' | 'planned' | 'transfer'
          diagnosis: string
          treatment_plan?: string | null
          status?: 'active' | 'discharged'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          room_id?: string
          doctor_id?: string
          admission_date?: string
          discharge_date?: string | null
          admission_type?: 'emergency' | 'planned' | 'transfer'
          diagnosis?: string
          treatment_plan?: string | null
          status?: 'active' | 'discharged'
          created_at?: string
          updated_at?: string
        }
      }
      billing: {
        Row: {
          id: string
          patient_id: string
          admission_id: string | null
          total_amount: number
          paid_amount: number
          outstanding_amount: number
          payment_status: 'pending' | 'partial' | 'paid' | 'overdue'
          billing_date: string
          due_date: string
          items: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          admission_id?: string | null
          total_amount: number
          paid_amount?: number
          outstanding_amount: number
          payment_status?: 'pending' | 'partial' | 'paid' | 'overdue'
          billing_date: string
          due_date: string
          items: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          admission_id?: string | null
          total_amount?: number
          paid_amount?: number
          outstanding_amount?: number
          payment_status?: 'pending' | 'partial' | 'paid' | 'overdue'
          billing_date?: string
          due_date?: string
          items?: any[]
          created_at?: string
          updated_at?: string
        }
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
  }
}