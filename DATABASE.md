# Hospital Management System - Database Setup

This document provides the complete database schema and setup instructions for the HMS application.

## Database Schema Overview

The HMS uses PostgreSQL (via Supabase) with the following main tables:

### Core Tables

1. **profiles** - User profiles linked to Supabase auth
2. **patients** - Patient information and medical records
3. **room_categories** - Types of hospital rooms (General, ICU, Private, etc.)
4. **rooms** - Individual room details and availability
5. **appointments** - Patient-doctor appointments
6. **admissions** - Patient admission records
7. **billing** - Financial records and billing information

### Key Features

- **UUID Primary Keys** - Using PostgreSQL UUID extension
- **Row Level Security (RLS)** - Supabase security policies
- **Automatic Timestamps** - Created/updated timestamps with triggers
- **Data Validation** - Check constraints for data integrity
- **Indexes** - Optimized for common queries
- **Views** - Pre-built reporting views

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema Setup

Run the following SQL files in order in your Supabase SQL editor:

1. **schema.sql** - Creates all tables, indexes, triggers, and RLS policies
2. **sample_data.sql** - Inserts sample data for testing (optional)

```sql
-- 1. Run schema.sql first
-- This creates all tables, functions, triggers, and security policies

-- 2. Run sample_data.sql (optional)
-- This adds sample data for testing and development
```

### 3. Authentication Setup

The system uses Supabase Auth with custom user profiles:

- Users are automatically created in the `profiles` table when they sign up
- Default role is set to 'receptionist'
- Admins can update user roles as needed

### 4. Security Policies

Basic RLS policies are included:
- Users can view/update their own profiles
- Staff roles can access patient data based on their permissions
- Customize policies based on your specific requirements

## User Roles

The system supports the following roles:

- **admin** - Full system access
- **doctor** - Patient care, appointments, admissions
- **nurse** - Patient care, limited admin functions
- **receptionist** - Patient registration, appointments
- **pharmacist** - Medication management
- **lab_tech** - Laboratory results
- **finance** - Billing and financial records

## Key Queries

### Patient Information
```sql
-- Get patient with recent appointments
SELECT p.*, COUNT(a.id) as appointment_count
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.patient_id = 'PAT001'
GROUP BY p.id;
```

### Room Availability
```sql
-- Check available rooms by category
SELECT rc.name, COUNT(r.id) as available_rooms
FROM room_categories rc
LEFT JOIN rooms r ON rc.id = r.room_category_id AND r.status = 'available'
GROUP BY rc.id, rc.name;
```

### Daily Revenue
```sql
-- Get daily revenue summary
SELECT * FROM daily_revenue
WHERE billing_date >= CURRENT_DATE - INTERVAL '30 days';
```

### Current Admissions
```sql
-- Active admissions with patient and room info
SELECT 
    p.patient_id,
    p.full_name,
    r.room_number,
    rc.name as room_type,
    a.admission_date,
    a.diagnosis
FROM admissions a
JOIN patients p ON a.patient_id = p.id
JOIN rooms r ON a.room_id = r.id
JOIN room_categories rc ON r.room_category_id = rc.id
WHERE a.status = 'active';
```

## Backup and Maintenance

### Regular Backups
```sql
-- Create a backup of patient data
SELECT * FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '1 year';
```

### Data Cleanup
```sql
-- Archive old appointments (older than 2 years)
UPDATE appointments 
SET status = 'archived' 
WHERE appointment_date < CURRENT_DATE - INTERVAL '2 years';
```

### Performance Monitoring
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';
```

## Common Issues and Solutions

### 1. UUID Generation
If UUID extension is not available:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Permissions
Ensure proper permissions for your application user:
```sql
GRANT USAGE ON SCHEMA public TO your_app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
```

### 3. RLS Policies
Test policies with different user roles:
```sql
-- Test as a specific user
SET ROLE your_test_user;
SELECT * FROM patients; -- Should respect RLS policies
```

## Environment Variables

Required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Local development
DATABASE_URL=postgresql://user:password@localhost:5432/hms_dev
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)