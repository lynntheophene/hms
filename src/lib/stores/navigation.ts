import { writable } from 'svelte/store'

export interface NavigationItem {
  id: string
  label: string
  icon: string
  path: string
  roles: string[]
  children?: NavigationItem[]
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'finance']
  },
  {
    id: 'patient-journey',
    label: 'Patient Journey',
    icon: 'Users',
    path: '/patient-journey',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    children: [
      { id: 'enquiry', label: 'Enquiry', icon: 'Search', path: '/patient-journey/enquiry', roles: ['admin', 'receptionist'] },
      { id: 'booking', label: 'Booking', icon: 'Calendar', path: '/patient-journey/booking', roles: ['admin', 'receptionist'] },
      { id: 'registration', label: 'Registration', icon: 'UserPlus', path: '/patient-journey/registration', roles: ['admin', 'receptionist'] },
      { id: 'admission', label: 'Admission', icon: 'UserCheck', path: '/patient-journey/admission', roles: ['admin', 'doctor', 'nurse'] },
      { id: 'discharge', label: 'Discharge', icon: 'UserMinus', path: '/patient-journey/discharge', roles: ['admin', 'doctor', 'nurse'] }
    ]
  },
  {
    id: 'front-office',
    label: 'Front Office',
    icon: 'Building',
    path: '/front-office',
    roles: ['admin', 'receptionist'],
    children: [
      { id: 'op-advances', label: 'OP Advances', icon: 'CreditCard', path: '/front-office/op-advances', roles: ['admin', 'receptionist'] },
      { id: 'registration', label: 'Registration', icon: 'FileText', path: '/front-office/registration', roles: ['admin', 'receptionist'] },
      { id: 'out-of-station', label: 'Out of Station', icon: 'MapPin', path: '/front-office/out-of-station', roles: ['admin', 'receptionist'] },
      { id: 'analysis', label: 'Analysis', icon: 'BarChart3', path: '/front-office/analysis', roles: ['admin'] }
    ]
  },
  {
    id: 'room-management',
    label: 'Room Management',
    icon: 'Bed',
    path: '/room-management',
    roles: ['admin', 'nurse', 'receptionist'],
    children: [
      { id: 'rooms', label: 'Rooms', icon: 'Home', path: '/room-management/rooms', roles: ['admin', 'nurse', 'receptionist'] },
      { id: 'booking', label: 'Room Booking', icon: 'Calendar', path: '/room-management/booking', roles: ['admin', 'nurse', 'receptionist'] },
      { id: 'categories', label: 'Room Categories', icon: 'Grid3x3', path: '/room-management/categories', roles: ['admin'] },
      { id: 'services', label: 'Room Services', icon: 'Settings', path: '/room-management/services', roles: ['admin'] }
    ]
  },
  {
    id: 'patient-care',
    label: 'Patient Care',
    icon: 'Heart',
    path: '/patient-care',
    roles: ['admin', 'doctor', 'nurse'],
    children: [
      { id: 'nursing-station', label: 'Nursing Station', icon: 'Stethoscope', path: '/patient-care/nursing-station', roles: ['admin', 'nurse'] },
      { id: 'op-consultation', label: 'OP Consultation', icon: 'UserCheck', path: '/patient-care/op-consultation', roles: ['admin', 'doctor'] },
      { id: 'operation-theater', label: 'Operation Theater', icon: 'Activity', path: '/patient-care/operation-theater', roles: ['admin', 'doctor'] }
    ]
  },
  {
    id: 'billing',
    label: 'Billing & Finance',
    icon: 'Receipt',
    path: '/billing',
    roles: ['admin', 'finance'],
    children: [
      { id: 'department-billing', label: 'Department Billing', icon: 'FileText', path: '/billing/department', roles: ['admin', 'finance'] },
      { id: 'central-cash', label: 'Central Cash', icon: 'Banknote', path: '/billing/central-cash', roles: ['admin', 'finance'] },
      { id: 'finance', label: 'Finance', icon: 'TrendingUp', path: '/billing/finance', roles: ['admin', 'finance'] }
    ]
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy & Inventory',
    icon: 'Pill',
    path: '/pharmacy',
    roles: ['admin', 'pharmacist'],
    children: [
      { id: 'pharmacy', label: 'Pharmacy', icon: 'Pill', path: '/pharmacy/pharmacy', roles: ['admin', 'pharmacist'] },
      { id: 'central-store', label: 'Central Store', icon: 'Package', path: '/pharmacy/central-store', roles: ['admin', 'pharmacist'] }
    ]
  },
  {
    id: 'laboratory',
    label: 'Laboratory',
    icon: 'TestTube',
    path: '/laboratory',
    roles: ['admin', 'lab_tech', 'doctor'],
    children: [
      { id: 'test-management', label: 'Test Management', icon: 'FlaskConical', path: '/laboratory/test-management', roles: ['admin', 'lab_tech'] },
      { id: 'sample-tracking', label: 'Sample Tracking', icon: 'Search', path: '/laboratory/sample-tracking', roles: ['admin', 'lab_tech'] }
    ]
  },
  {
    id: 'hr-payroll',
    label: 'HR & Payroll',
    icon: 'Users2',
    path: '/hr-payroll',
    roles: ['admin'],
    children: [
      { id: 'hr-management', label: 'HR Management', icon: 'UserCog', path: '/hr-payroll/hr-management', roles: ['admin'] },
      { id: 'payroll', label: 'Payroll Processing', icon: 'Calculator', path: '/hr-payroll/payroll', roles: ['admin'] }
    ]
  },
  {
    id: 'reports',
    label: 'Reports & MIS',
    icon: 'BarChart3',
    path: '/reports',
    roles: ['admin', 'doctor', 'finance'],
    children: [
      { id: 'dashboards', label: 'Dashboards', icon: 'Monitor', path: '/reports/dashboards', roles: ['admin', 'doctor', 'finance'] },
      { id: 'report-builder', label: 'Report Builder', icon: 'FileBarChart', path: '/reports/report-builder', roles: ['admin'] }
    ]
  }
]

export const currentPath = writable<string>('/')
export const sidebarOpen = writable<boolean>(true)