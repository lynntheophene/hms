-- Sample Data for Hospital Management System
-- Insert this data after creating the main schema

-- Insert room categories
INSERT INTO public.room_categories (name, description, base_rate) VALUES
('General Ward', 'Standard hospital room with basic amenities', 1500.00),
('Private Room', 'Single occupancy room with private bathroom', 3000.00),
('ICU', 'Intensive Care Unit with advanced monitoring', 8000.00),
('Emergency Ward', 'Emergency department bed', 2000.00),
('Surgery Room', 'Operating theatre for surgical procedures', 15000.00),
('Maternity Ward', 'Specialized rooms for maternity care', 3500.00);

-- Insert sample rooms
INSERT INTO public.rooms (room_number, room_category_id, floor, capacity, status, amenities, rate_per_day) VALUES
-- Ground Floor - Emergency
('E001', (SELECT id FROM public.room_categories WHERE name = 'Emergency Ward'), 0, 1, 'available', ARRAY['oxygen', 'monitor'], 2000.00),
('E002', (SELECT id FROM public.room_categories WHERE name = 'Emergency Ward'), 0, 1, 'available', ARRAY['oxygen', 'monitor'], 2000.00),
('E003', (SELECT id FROM public.room_categories WHERE name = 'Emergency Ward'), 0, 1, 'occupied', ARRAY['oxygen', 'monitor'], 2000.00),

-- First Floor - General Ward
('G101', (SELECT id FROM public.room_categories WHERE name = 'General Ward'), 1, 4, 'available', ARRAY['tv', 'wifi'], 1500.00),
('G102', (SELECT id FROM public.room_categories WHERE name = 'General Ward'), 1, 4, 'occupied', ARRAY['tv', 'wifi'], 1500.00),
('G103', (SELECT id FROM public.room_categories WHERE name = 'General Ward'), 1, 4, 'available', ARRAY['tv', 'wifi'], 1500.00),
('G104', (SELECT id FROM public.room_categories WHERE name = 'General Ward'), 1, 4, 'maintenance', ARRAY['tv', 'wifi'], 1500.00),

-- Second Floor - Private Rooms
('P201', (SELECT id FROM public.room_categories WHERE name = 'Private Room'), 2, 1, 'available', ARRAY['tv', 'wifi', 'ac', 'refrigerator'], 3000.00),
('P202', (SELECT id FROM public.room_categories WHERE name = 'Private Room'), 2, 1, 'occupied', ARRAY['tv', 'wifi', 'ac', 'refrigerator'], 3000.00),
('P203', (SELECT id FROM public.room_categories WHERE name = 'Private Room'), 2, 1, 'available', ARRAY['tv', 'wifi', 'ac', 'refrigerator'], 3000.00),

-- Third Floor - ICU
('I301', (SELECT id FROM public.room_categories WHERE name = 'ICU'), 3, 1, 'available', ARRAY['ventilator', 'monitor', 'oxygen', 'emergency_call'], 8000.00),
('I302', (SELECT id FROM public.room_categories WHERE name = 'ICU'), 3, 1, 'occupied', ARRAY['ventilator', 'monitor', 'oxygen', 'emergency_call'], 8000.00),
('I303', (SELECT id FROM public.room_categories WHERE name = 'ICU'), 3, 1, 'available', ARRAY['ventilator', 'monitor', 'oxygen', 'emergency_call'], 8000.00),

-- Fourth Floor - Maternity
('M401', (SELECT id FROM public.room_categories WHERE name = 'Maternity Ward'), 4, 1, 'available', ARRAY['tv', 'wifi', 'nursery_access'], 3500.00),
('M402', (SELECT id FROM public.room_categories WHERE name = 'Maternity Ward'), 4, 1, 'occupied', ARRAY['tv', 'wifi', 'nursery_access'], 3500.00);

-- Note: Profiles are typically created through the authentication system
-- These are sample inserts for testing purposes only
-- In production, use Supabase Auth to create users first

-- Sample profiles (these IDs should match actual auth.users IDs in production)
INSERT INTO public.profiles (id, email, full_name, role, department, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@hospital.com', 'Dr. Admin User', 'admin', 'Administration', '+1234567890'),
('550e8400-e29b-41d4-a716-446655440002', 'doctor1@hospital.com', 'Dr. John Smith', 'doctor', 'Cardiology', '+1234567891'),
('550e8400-e29b-41d4-a716-446655440003', 'doctor2@hospital.com', 'Dr. Sarah Johnson', 'doctor', 'Pediatrics', '+1234567892'),
('550e8400-e29b-41d4-a716-446655440004', 'nurse1@hospital.com', 'Nurse Mary Williams', 'nurse', 'General Ward', '+1234567893'),
('550e8400-e29b-41d4-a716-446655440005', 'receptionist@hospital.com', 'Jane Doe', 'receptionist', 'Front Desk', '+1234567894'),
('550e8400-e29b-41d4-a716-446655440006', 'pharmacist@hospital.com', 'Mike Brown', 'pharmacist', 'Pharmacy', '+1234567895'),
('550e8400-e29b-41d4-a716-446655440007', 'labtech@hospital.com', 'Lisa Chen', 'lab_tech', 'Laboratory', '+1234567896'),
('550e8400-e29b-41d4-a716-446655440008', 'finance@hospital.com', 'Robert Davis', 'finance', 'Finance', '+1234567897');

-- Sample patients
INSERT INTO public.patients (patient_id, full_name, date_of_birth, gender, phone, email, address, emergency_contact, emergency_phone, blood_group, status) VALUES
('PAT001', 'Alice Johnson', '1985-03-15', 'female', '+1987654321', 'alice.johnson@email.com', '123 Main St, City, State 12345', 'Bob Johnson', '+1987654322', 'A+', 'registered'),
('PAT002', 'Michael Brown', '1978-07-22', 'male', '+1987654323', 'michael.brown@email.com', '456 Oak Ave, City, State 12345', 'Susan Brown', '+1987654324', 'O-', 'admitted'),
('PAT003', 'Emma Davis', '1992-11-08', 'female', '+1987654325', 'emma.davis@email.com', '789 Pine St, City, State 12345', 'David Davis', '+1987654326', 'B+', 'registered'),
('PAT004', 'James Wilson', '1965-04-12', 'male', '+1987654327', 'james.wilson@email.com', '321 Elm St, City, State 12345', 'Mary Wilson', '+1987654328', 'AB+', 'enquiry'),
('PAT005', 'Sophia Martinez', '1990-09-30', 'female', '+1987654329', 'sophia.martinez@email.com', '654 Maple Dr, City, State 12345', 'Carlos Martinez', '+1987654330', 'A-', 'discharged');

-- Sample appointments
INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, type, status, notes) VALUES
((SELECT id FROM public.patients WHERE patient_id = 'PAT001'), '550e8400-e29b-41d4-a716-446655440002', '2024-01-15', '09:00:00', 'consultation', 'confirmed', 'Regular checkup'),
((SELECT id FROM public.patients WHERE patient_id = 'PAT002'), '550e8400-e29b-41d4-a716-446655440003', '2024-01-15', '10:30:00', 'follow_up', 'scheduled', 'Post-surgery follow-up'),
((SELECT id FROM public.patients WHERE patient_id = 'PAT003'), '550e8400-e29b-41d4-a716-446655440002', '2024-01-16', '14:00:00', 'consultation', 'confirmed', 'Chest pain evaluation'),
((SELECT id FROM public.patients WHERE patient_id = 'PAT004'), '550e8400-e29b-41d4-a716-446655440003', '2024-01-16', '11:00:00', 'consultation', 'scheduled', 'Pediatric consultation'),
((SELECT id FROM public.patients WHERE patient_id = 'PAT005'), '550e8400-e29b-41d4-a716-446655440002', '2024-01-17', '15:30:00', 'follow_up', 'completed', 'Recovery assessment');

-- Sample admissions
INSERT INTO public.admissions (patient_id, room_id, doctor_id, admission_date, admission_type, diagnosis, treatment_plan, status) VALUES
((SELECT id FROM public.patients WHERE patient_id = 'PAT002'), 
 (SELECT id FROM public.rooms WHERE room_number = 'P202'), 
 '550e8400-e29b-41d4-a716-446655440002', 
 '2024-01-10 08:00:00+00', 
 'planned', 
 'Cardiac catheterization', 
 'Post-procedure monitoring and recovery', 
 'active'),
((SELECT id FROM public.patients WHERE patient_id = 'PAT005'), 
 (SELECT id FROM public.rooms WHERE room_number = 'G102'), 
 '550e8400-e29b-41d4-a716-446655440003', 
 '2024-01-05 12:00:00+00', 
 'emergency', 
 'Acute appendicitis', 
 'Post-operative care and monitoring', 
 'discharged');

-- Update room occupancy for admitted patients
UPDATE public.rooms SET current_occupancy = 1 WHERE room_number IN ('P202');

-- Sample billing records
INSERT INTO public.billing (patient_id, admission_id, total_amount, paid_amount, payment_status, billing_date, due_date, items) VALUES
((SELECT id FROM public.patients WHERE patient_id = 'PAT002'),
 (SELECT id FROM public.admissions WHERE patient_id = (SELECT id FROM public.patients WHERE patient_id = 'PAT002')),
 25000.00,
 15000.00,
 'partial',
 '2024-01-12',
 '2024-01-27',
 '[
   {"item": "Room charges (Private)", "quantity": 3, "rate": 3000.00, "amount": 9000.00},
   {"item": "Doctor consultation", "quantity": 2, "rate": 1500.00, "amount": 3000.00},
   {"item": "Cardiac catheterization", "quantity": 1, "rate": 10000.00, "amount": 10000.00},
   {"item": "Medications", "quantity": 1, "rate": 2000.00, "amount": 2000.00},
   {"item": "Lab tests", "quantity": 1, "rate": 1000.00, "amount": 1000.00}
 ]'::jsonb),
((SELECT id FROM public.patients WHERE patient_id = 'PAT005'),
 (SELECT id FROM public.admissions WHERE patient_id = (SELECT id FROM public.patients WHERE patient_id = 'PAT005')),
 18000.00,
 18000.00,
 'paid',
 '2024-01-08',
 '2024-01-23',
 '[
   {"item": "Room charges (General Ward)", "quantity": 2, "rate": 1500.00, "amount": 3000.00},
   {"item": "Emergency treatment", "quantity": 1, "rate": 5000.00, "amount": 5000.00},
   {"item": "Surgery (Appendectomy)", "quantity": 1, "rate": 8000.00, "amount": 8000.00},
   {"item": "Medications", "quantity": 1, "rate": 1500.00, "amount": 1500.00},
   {"item": "Lab tests", "quantity": 1, "rate": 500.00, "amount": 500.00}
 ]'::jsonb);

-- Create some useful views for reporting
CREATE OR REPLACE VIEW patient_summary AS
SELECT 
    p.patient_id,
    p.full_name,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.status,
    COUNT(ap.id) as total_appointments,
    COUNT(ad.id) as total_admissions,
    COALESCE(SUM(b.total_amount), 0) as total_billing,
    COALESCE(SUM(b.outstanding_amount), 0) as outstanding_amount
FROM public.patients p
LEFT JOIN public.appointments ap ON p.id = ap.patient_id
LEFT JOIN public.admissions ad ON p.id = ad.patient_id
LEFT JOIN public.billing b ON p.id = b.patient_id
GROUP BY p.id, p.patient_id, p.full_name, p.date_of_birth, p.gender, p.phone, p.status;

CREATE OR REPLACE VIEW room_occupancy_summary AS
SELECT 
    rc.name as category,
    COUNT(r.id) as total_rooms,
    SUM(r.capacity) as total_capacity,
    SUM(r.current_occupancy) as current_occupancy,
    ROUND((SUM(r.current_occupancy)::decimal / SUM(r.capacity)::decimal) * 100, 2) as occupancy_percentage
FROM public.room_categories rc
LEFT JOIN public.rooms r ON rc.id = r.room_category_id
GROUP BY rc.id, rc.name;

CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
    b.billing_date,
    COUNT(b.id) as total_bills,
    SUM(b.total_amount) as total_revenue,
    SUM(b.paid_amount) as collected_amount,
    SUM(b.outstanding_amount) as outstanding_amount
FROM public.billing b
GROUP BY b.billing_date
ORDER BY b.billing_date DESC;

-- Grant permissions for the views
GRANT SELECT ON patient_summary TO authenticated;
GRANT SELECT ON room_occupancy_summary TO authenticated;
GRANT SELECT ON daily_revenue TO authenticated;