# Enquiry Table Setup Guide

This document explains how to set up the enquiries table and related functionality in the Hospital Management System.

## Issue Fixed

The enquiries table functionality was not working due to missing TypeScript type definitions. This has been resolved by:

1. **Added missing table type definitions** to `src/lib/types/database.ts` for:
   - `enquiries` - Patient inquiries and appointment requests  
   - `bills` - Detailed billing management
   - `bill_items` - Individual bill line items
   - `payments` - Payment records
   - `medicines` - Pharmacy inventory
   - `stock_transactions` - Medicine stock movements
   - `lab_tests` - Laboratory test records
   - `test_templates` - Test configuration templates

2. **Updated patients table types** with missing fields like `insurance_number`, `nationality`, etc.

## Database Schema

The enquiries table already exists in `schema.sql` and includes:

- `id` - Unique identifier
- `enquiry_id` - Human-readable enquiry ID (e.g., ENQ001)
- `patient_name` - Patient's full name
- `phone` - Contact phone number  
- `email` - Contact email (optional)
- `enquiry_type` - Type: appointment, general, emergency, follow_up, complaint
- `department` - Department requested
- `preferred_date` - Preferred appointment date (optional)
- `preferred_time` - Preferred appointment time (optional)
- `message` - Inquiry description
- `status` - Status: pending, contacted, scheduled, converted, cancelled
- `assigned_to` - Staff member assigned (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Setup Instructions

### For Development (Demo Mode)
The application runs in demo mode by default with mock data. No database setup is required.

### For Production
1. Set up a Supabase project
2. Apply the schema: `psql -f schema.sql your_database_url`
3. Set environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Features Working

✅ **Enquiry Management Page** - View all patient enquiries  
✅ **New Enquiry Creation** - Create new patient inquiries  
✅ **Status Updates** - Mark enquiries as contacted, scheduled, etc.  
✅ **Search & Filtering** - Filter by status, department  
✅ **TypeScript Type Safety** - Full type safety for all database operations  

## Testing

The enquiry functionality has been tested and confirmed working:
- Creating new enquiries with auto-generated IDs
- Displaying enquiry cards with all information
- Status updates via action menus
- Form validation and error handling