-- Hospital Management System Database Schema
-- Generated for Supabase/PostgreSQL

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'finance')),
    department TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create room_categories table
CREATE TABLE IF NOT EXISTS public.room_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_rate DECIMAL(10,2) NOT NULL CHECK (base_rate >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    room_category_id UUID NOT NULL REFERENCES public.room_categories(id) ON DELETE RESTRICT,
    floor INTEGER NOT NULL CHECK (floor >= 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    amenities TEXT[] DEFAULT '{}',
    rate_per_day DECIMAL(10,2) NOT NULL CHECK (rate_per_day >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_occupancy_capacity CHECK (current_occupancy <= capacity)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    blood_group TEXT,
    allergies TEXT,
    medical_history TEXT,
    insurance_number TEXT,
    id_number TEXT,
    nationality TEXT,
    occupation TEXT,
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    status TEXT DEFAULT 'enquiry' CHECK (status IN ('enquiry', 'registered', 'admitted', 'discharged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('consultation', 'follow_up', 'emergency', 'surgery')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admissions table
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discharge_date TIMESTAMP WITH TIME ZONE,
    admission_type TEXT NOT NULL CHECK (admission_type IN ('emergency', 'planned', 'transfer')),
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discharged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_discharge_after_admission CHECK (discharge_date IS NULL OR discharge_date >= admission_date)
);

-- Create billing table
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    admission_id UUID REFERENCES public.admissions(id) ON DELETE SET NULL,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount DECIMAL(12,2) DEFAULT 0 CHECK (paid_amount >= 0),
    outstanding_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_paid_amount CHECK (paid_amount <= total_amount),
    CONSTRAINT check_due_date CHECK (due_date >= billing_date)
);

-- Create bills table for detailed billing management
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_id TEXT NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount DECIMAL(12,2) DEFAULT 0 CHECK (paid_amount >= 0),
    outstanding_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    payment_method TEXT,
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    department TEXT NOT NULL,
    doctor_name TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_bill_paid_amount CHECK (paid_amount <= total_amount),
    CONSTRAINT check_bill_due_date CHECK (due_date >= bill_date)
);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS public.bill_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    notes TEXT,
    processed_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create medicines table for pharmacy management
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    generic_name TEXT,
    manufacturer TEXT NOT NULL,
    category TEXT NOT NULL,
    dosage_form TEXT NOT NULL,
    strength TEXT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
    reorder_level INTEGER NOT NULL CHECK (reorder_level >= 0),
    expiry_date DATE NOT NULL,
    batch_number TEXT NOT NULL,
    supplier TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    reference_id TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create lab_tests table for laboratory management
CREATE TABLE IF NOT EXISTS public.lab_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_id TEXT NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    test_name TEXT NOT NULL,
    test_category TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    sample_type TEXT NOT NULL,
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE,
    result_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'processing', 'completed', 'reported')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'stat')),
    results JSONB,
    notes TEXT,
    technician TEXT,
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create test_templates table
CREATE TABLE IF NOT EXISTS public.test_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    sample_type TEXT NOT NULL,
    normal_range TEXT,
    unit TEXT,
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    processing_time INTEGER NOT NULL CHECK (processing_time > 0), -- in hours
    preparation_required BOOLEAN DEFAULT FALSE,
    preparation_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enquiries table for patient enquiries
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    enquiry_id TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('appointment', 'general', 'emergency', 'follow_up', 'complaint')),
    department TEXT NOT NULL,
    preferred_date DATE,
    preferred_time TIME,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'converted', 'cancelled')),
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON public.rooms(floor);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON public.admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON public.admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_billing_patient ON public.billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_due_date ON public.billing(due_date);

-- New indexes for additional tables
CREATE INDEX IF NOT EXISTS idx_bills_bill_id ON public.bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient ON public.bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_date ON public.bills(bill_date);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON public.bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill ON public.payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_medicines_medicine_id ON public.medicines(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_status ON public.medicines(status);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON public.medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_medicine ON public.stock_transactions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON public.stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_lab_tests_test_id ON public.lab_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_patient ON public.lab_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_status ON public.lab_tests(status);
CREATE INDEX IF NOT EXISTS idx_lab_tests_collection_date ON public.lab_tests(collection_date);
CREATE INDEX IF NOT EXISTS idx_test_templates_category ON public.test_templates(category);
CREATE INDEX IF NOT EXISTS idx_enquiries_enquiry_id ON public.enquiries(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_department ON public.enquiries(department);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update timestamps
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_patients
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_rooms
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_appointments
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_admissions
    BEFORE UPDATE ON public.admissions
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_billing
    BEFORE UPDATE ON public.billing
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- New triggers for additional tables
CREATE TRIGGER set_timestamp_bills
    BEFORE UPDATE ON public.bills
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_medicines
    BEFORE UPDATE ON public.medicines
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_lab_tests
    BEFORE UPDATE ON public.lab_tests
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_test_templates
    BEFORE UPDATE ON public.test_templates
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_enquiries
    BEFORE UPDATE ON public.enquiries
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- Enable RLS for new tables
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - customize based on your requirements)
-- Profiles policy - users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Patients policy - staff can view all patients
CREATE POLICY "Staff can view all patients" ON public.patients
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Appointments policy
CREATE POLICY "Staff can view appointments" ON public.appointments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Similar policies can be created for other tables based on role requirements

-- Policies for new tables
CREATE POLICY "Staff can view bills" ON public.bills
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'finance', 'doctor', 'nurse', 'receptionist')
        )
    );

CREATE POLICY "Staff can view medicines" ON public.medicines
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'pharmacist', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Staff can view lab tests" ON public.lab_tests
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'lab_tech', 'nurse')
        )
    );

CREATE POLICY "Staff can view enquiries" ON public.enquiries
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'receptionist', 'doctor', 'nurse')
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'receptionist');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();