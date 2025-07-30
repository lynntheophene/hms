-- Add missing RLS policies for dashboard data access
-- This file adds SELECT policies for tables that are missing them

-- Rooms policy - staff can view all rooms
CREATE POLICY "Staff can view all rooms" ON public.rooms
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Room categories policy - staff can view all room categories
CREATE POLICY "Staff can view all room categories" ON public.room_categories
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Admissions policy - staff can view all admissions
CREATE POLICY "Staff can view all admissions" ON public.admissions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Billing policy - staff can view all billing records
CREATE POLICY "Staff can view all billing" ON public.billing
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Optional: Add INSERT, UPDATE, DELETE policies for full CRUD operations
-- You can uncomment and run these if you need write access from the frontend

-- Rooms CRUD policies
-- CREATE POLICY "Staff can insert rooms" ON public.rooms
--     FOR INSERT TO authenticated
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM public.profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'receptionist')
--         )
--     );

-- CREATE POLICY "Staff can update rooms" ON public.rooms
--     FOR UPDATE TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'receptionist')
--         )
--     );

-- Similar patterns can be applied to other tables as needed
