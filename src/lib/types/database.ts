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
          insurance_number: string | null
          id_number: string | null
          nationality: string | null
          occupation: string | null
          marital_status: 'single' | 'married' | 'divorced' | 'widowed' | null
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
          insurance_number?: string | null
          id_number?: string | null
          nationality?: string | null
          occupation?: string | null
          marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | null
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
          insurance_number?: string | null
          id_number?: string | null
          nationality?: string | null
          occupation?: string | null
          marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | null
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
      bills: {
        Row: {
          id: string
          bill_id: string
          patient_id: string
          patient_name: string
          bill_date: string
          due_date: string
          total_amount: number
          paid_amount: number
          outstanding_amount: number
          status: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
          payment_method: string | null
          discount_amount: number
          tax_amount: number
          department: string
          doctor_name: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          patient_id: string
          patient_name: string
          bill_date: string
          due_date: string
          total_amount: number
          paid_amount?: number
          outstanding_amount: number
          status?: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null
          discount_amount?: number
          tax_amount?: number
          department: string
          doctor_name?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          patient_id?: string
          patient_name?: string
          bill_date?: string
          due_date?: string
          total_amount?: number
          paid_amount?: number
          outstanding_amount?: number
          status?: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null
          discount_amount?: number
          tax_amount?: number
          department?: string
          doctor_name?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      bill_items: {
        Row: {
          id: string
          bill_id: string
          description: string
          quantity: number
          unit_price: number
          total_price: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          description: string
          quantity: number
          unit_price: number
          total_price: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          category?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          bill_id: string
          payment_date: string
          amount: number
          payment_method: string
          reference_number: string | null
          notes: string | null
          processed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          payment_date: string
          amount: number
          payment_method: string
          reference_number?: string | null
          notes?: string | null
          processed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          payment_date?: string
          amount?: number
          payment_method?: string
          reference_number?: string | null
          notes?: string | null
          processed_by?: string
          created_at?: string
        }
      }
      medicines: {
        Row: {
          id: string
          medicine_id: string
          name: string
          generic_name: string | null
          manufacturer: string
          category: string
          dosage_form: string
          strength: string
          unit_price: number
          stock_quantity: number
          reorder_level: number
          expiry_date: string
          batch_number: string
          supplier: string
          status: 'active' | 'inactive' | 'discontinued'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          medicine_id: string
          name: string
          generic_name?: string | null
          manufacturer: string
          category: string
          dosage_form: string
          strength: string
          unit_price: number
          stock_quantity: number
          reorder_level: number
          expiry_date: string
          batch_number: string
          supplier: string
          status?: 'active' | 'inactive' | 'discontinued'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          medicine_id?: string
          name?: string
          generic_name?: string | null
          manufacturer?: string
          category?: string
          dosage_form?: string
          strength?: string
          unit_price?: number
          stock_quantity?: number
          reorder_level?: number
          expiry_date?: string
          batch_number?: string
          supplier?: string
          status?: 'active' | 'inactive' | 'discontinued'
          created_at?: string
          updated_at?: string
        }
      }
      stock_transactions: {
        Row: {
          id: string
          medicine_id: string
          medicine_name: string
          transaction_type: 'in' | 'out' | 'adjustment'
          quantity: number
          unit_price: number
          total_amount: number
          reference_id: string | null
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          medicine_id: string
          medicine_name: string
          transaction_type: 'in' | 'out' | 'adjustment'
          quantity: number
          unit_price: number
          total_amount: number
          reference_id?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          medicine_id?: string
          medicine_name?: string
          transaction_type?: 'in' | 'out' | 'adjustment'
          quantity?: number
          unit_price?: number
          total_amount?: number
          reference_id?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
        }
      }
      lab_tests: {
        Row: {
          id: string
          test_id: string
          patient_id: string
          patient_name: string
          test_name: string
          test_category: string
          doctor_name: string
          sample_type: string
          collection_date: string
          test_date: string | null
          result_date: string | null
          status: 'pending' | 'collected' | 'processing' | 'completed' | 'reported'
          priority: 'normal' | 'urgent' | 'stat'
          results: any | null
          notes: string | null
          technician: string | null
          cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          test_id: string
          patient_id: string
          patient_name: string
          test_name: string
          test_category: string
          doctor_name: string
          sample_type: string
          collection_date: string
          test_date?: string | null
          result_date?: string | null
          status?: 'pending' | 'collected' | 'processing' | 'completed' | 'reported'
          priority?: 'normal' | 'urgent' | 'stat'
          results?: any | null
          notes?: string | null
          technician?: string | null
          cost: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          patient_id?: string
          patient_name?: string
          test_name?: string
          test_category?: string
          doctor_name?: string
          sample_type?: string
          collection_date?: string
          test_date?: string | null
          result_date?: string | null
          status?: 'pending' | 'collected' | 'processing' | 'completed' | 'reported'
          priority?: 'normal' | 'urgent' | 'stat'
          results?: any | null
          notes?: string | null
          technician?: string | null
          cost?: number
          created_at?: string
          updated_at?: string
        }
      }
      test_templates: {
        Row: {
          id: string
          name: string
          category: string
          sample_type: string
          normal_range: string | null
          unit: string | null
          cost: number
          processing_time: number
          preparation_required: boolean
          preparation_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          sample_type: string
          normal_range?: string | null
          unit?: string | null
          cost: number
          processing_time: number
          preparation_required?: boolean
          preparation_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          sample_type?: string
          normal_range?: string | null
          unit?: string | null
          cost?: number
          processing_time?: number
          preparation_required?: boolean
          preparation_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enquiries: {
        Row: {
          id: string
          enquiry_id: string
          patient_name: string
          phone: string
          email: string | null
          enquiry_type: 'appointment' | 'general' | 'emergency' | 'follow_up' | 'complaint'
          department: string
          preferred_date: string | null
          preferred_time: string | null
          message: string
          status: 'pending' | 'contacted' | 'scheduled' | 'converted' | 'cancelled'
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enquiry_id: string
          patient_name: string
          phone: string
          email?: string | null
          enquiry_type: 'appointment' | 'general' | 'emergency' | 'follow_up' | 'complaint'
          department: string
          preferred_date?: string | null
          preferred_time?: string | null
          message: string
          status?: 'pending' | 'contacted' | 'scheduled' | 'converted' | 'cancelled'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enquiry_id?: string
          patient_name?: string
          phone?: string
          email?: string | null
          enquiry_type?: 'appointment' | 'general' | 'emergency' | 'follow_up' | 'complaint'
          department?: string
          preferred_date?: string | null
          preferred_time?: string | null
          message?: string
          status?: 'pending' | 'contacted' | 'scheduled' | 'converted' | 'cancelled'
          assigned_to?: string | null
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