<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { Search, Plus, Phone, Mail, Calendar, User, Clock, Filter, Menu, Check, X } from 'lucide-svelte'
  import { format } from 'date-fns'
  import NewEnquiryModal from './NewEnquiryModal.svelte'
  import PatientRegistrationModal from './PatientRegistrationModal.svelte'
  
  interface Enquiry {
    id: string
    enquiry_id: string
    patient_name: string
    phone: string
    email?: string
    enquiry_type: string
    department: string
    preferred_date?: string
    preferred_time?: string
    message: string
    status: 'pending' | 'contacted' | 'scheduled' | 'converted' | 'cancelled' | 'completed'
    assigned_to?: string
    created_at: string
    updated_at: string
  }
  
  let enquiries: Enquiry[] = []
  let loading = true
  let searchTerm = ''
  let statusFilter = 'all'
  let departmentFilter = 'all'
  let showNewEnquiryModal = false
  let showActionMenu: string | null = null
  let showCompleteModal = false
  let selectedEnquiry: Enquiry | null = null
  // TODO: Replace with actual user role from auth store or prop
  let userRole = 'admin';
  
  // Mock data for demo mode
  const mockEnquiries: Enquiry[] = [
    {
      id: '1',
      enquiry_id: 'ENQ001',
      patient_name: 'John Smith',
      phone: '+1234567890',
      email: 'john.smith@email.com',
      enquiry_type: 'appointment',
      department: 'Cardiology',
      preferred_date: '2024-02-15',
      preferred_time: '10:00',
      message: 'Need consultation for chest pain',
      status: 'pending',
      created_at: '2024-01-20T09:00:00Z',
      updated_at: '2024-01-20T09:00:00Z'
    },
    {
      id: '2',
      enquiry_id: 'ENQ002',
      patient_name: 'Mary Johnson',
      phone: '+1234567891',
      email: 'mary.johnson@email.com',
      enquiry_type: 'general',
      department: 'General Medicine',
      message: 'Inquiry about vaccination schedule',
      status: 'contacted',
      assigned_to: 'Dr. Sarah Wilson',
      created_at: '2024-01-19T14:30:00Z',
      updated_at: '2024-01-20T10:15:00Z'
    },
    {
      id: '3',
      enquiry_id: 'ENQ003',
      patient_name: 'Robert Brown',
      phone: '+1234567892',
      enquiry_type: 'emergency',
      department: 'Emergency',
      message: 'Urgent consultation needed',
      status: 'scheduled',
      assigned_to: 'Dr. Michael Chen',
      created_at: '2024-01-20T16:45:00Z',
      updated_at: '2024-01-20T17:00:00Z'
    }
  ]
  
  const enquiryTypes = [
    { value: 'appointment', label: 'Appointment Request' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'complaint', label: 'Complaint' }
  ]
  
  const departments = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Gynecology', 'Emergency', 'Surgery', 'Radiology'
  ]
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'converted', label: 'Converted' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ]
  
  $: filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.enquiry_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || enquiry.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })
  
  onMount(async () => {
    await loadEnquiries()
  })
  
  async function loadEnquiries() {
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        enquiries = mockEnquiries
      } else {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        enquiries = data || []
      }
    } catch (error) {
      console.error('Error loading enquiries:', error)
      enquiries = []
    } finally {
      loading = false
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'contacted': return 'status-contacted'
      case 'scheduled': return 'status-scheduled'
      case 'converted': return 'status-converted'
      case 'cancelled': return 'status-cancelled'
      case 'completed': return 'status-completed'
      default: return 'status-default'
    }
  }
  
  function getPriorityColor(type: string): string {
    switch (type) {
      case 'emergency': return 'priority-high'
      case 'appointment': return 'priority-medium'
      default: return 'priority-low'
    }
  }
  
  function toggleActionMenu(enquiryId: string) {
    showActionMenu = showActionMenu === enquiryId ? null : enquiryId
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.action-menu-container')) {
      showActionMenu = null
    }
  }
  
  async function updateEnquiryStatus(enquiryId: string, newStatus: string) {
    try {
      if (isDemoMode) {
        const index = enquiries.findIndex(e => e.id === enquiryId)
        if (index !== -1) {
          enquiries[index].status = newStatus as any
          enquiries[index].updated_at = new Date().toISOString()
          enquiries = [...enquiries]
        }
      } else {
        const { error } = await supabase
          .from('enquiries')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', enquiryId)
        
        if (error) throw error
        await loadEnquiries()
      }
      showActionMenu = null
    } catch (error) {
      console.error('Error updating enquiry status:', error)
    }
  }
  
  function handleNewEnquiry(event: CustomEvent) {
    const newEnquiry = event.detail
    enquiries = [{ ...newEnquiry, id: newEnquiry.enquiry_id }, ...enquiries]
    showNewEnquiryModal = false
  }

  function openCompleteModal(enquiry: Enquiry) {
    selectedEnquiry = enquiry;
    showCompleteModal = true;
    showActionMenu = null;
  }

  function handleCloseCompleteModal() {
    showCompleteModal = false;
    selectedEnquiry = null;
    loadEnquiries();
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="enquiry-container">
  <div class="page-header">
    <div class="header-left">
      <h2>Patient Enquiries</h2>
      <p>Manage patient inquiries and appointment requests</p>
    </div>
    <button class="add-button" on:click={() => showNewEnquiryModal = true}>
      <Plus size={20} />
      New Enquiry
    </button>
  </div>
  
  <div class="filters">
    <div class="search-box">
      <Search class="search-icon" size={20} />
      <input
        type="text"
        placeholder="Search enquiries by name, ID, or phone..."
        bind:value={searchTerm}
      />
    </div>
    
    <div class="filter-group">
      <select bind:value={statusFilter} class="filter-select">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      
      <select bind:value={departmentFilter} class="filter-select">
        <option value="all">All Departments</option>
        {#each departments as department}
          <option value={department}>{department}</option>
        {/each}
      </select>
      
      <button class="filter-button">
        <Filter size={20} />
        More Filters
      </button>
    </div>
  </div>
  
  <div class="content-area">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading enquiries...</p>
      </div>
    {:else if filteredEnquiries.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📞</div>
        <h3>No enquiries found</h3>
        <p>
          {#if searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'}
            Try adjusting your search or filters
          {:else}
            No patient enquiries yet
          {/if}
        </p>
      </div>
    {:else}
      <div class="enquiries-grid">
        {#each filteredEnquiries as enquiry}
          <div class="enquiry-card">
            <div class="card-header">
              <div class="enquiry-info">
                <span class="enquiry-id">{enquiry.enquiry_id}</span>
                <span class="enquiry-type {getPriorityColor(enquiry.enquiry_type)}">
                  {enquiryTypes.find(t => t.value === enquiry.enquiry_type)?.label || enquiry.enquiry_type}
                </span>
              </div>
              <div class="action-menu-container">
                <button 
                  class="action-button"
                  aria-label="Actions"
                  on:click={() => toggleActionMenu(enquiry.id)}
                >
                  <span class="three-dots">⋮</span>
                </button>
                {#if showActionMenu === enquiry.id}
                  <div class="action-menu">
                    <button class="menu-item" on:click={() => updateEnquiryStatus(enquiry.id, 'contacted')}>
                      <Phone size={16} />
                      Mark as Contacted
                    </button>
                    <button class="menu-item" on:click={() => updateEnquiryStatus(enquiry.id, 'scheduled')}>
                      <Calendar size={16} />
                      Schedule Appointment
                    </button>
                    <button class="menu-item" on:click={() => updateEnquiryStatus(enquiry.id, 'converted')}>
                      <Check size={16} />
                      Mark as Converted
                    </button>
                    <hr class="menu-divider" />
                    <button class="menu-item danger" on:click={() => updateEnquiryStatus(enquiry.id, 'cancelled')}>
                      <X size={16} />
                      Cancel Enquiry
                    </button>
                    {#if (userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin')}
                      <button class="menu-item" on:click={() => openCompleteModal(enquiry)}>
                        <Check size={16} />
                        Mark as Completed
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
            
            <div class="patient-info">
              <h4>{enquiry.patient_name}</h4>
              <div class="contact-details">
                <span class="contact-item">
                  <Phone size={14} />
                  {enquiry.phone}
                </span>
                {#if enquiry.email}
                  <span class="contact-item">
                    <Mail size={14} />
                    {enquiry.email}
                  </span>
                {/if}
              </div>
            </div>
            
            <div class="enquiry-details">
              <div class="detail-row">
                <span class="label">Department:</span>
                <span class="value">{enquiry.department}</span>
              </div>
              
              {#if enquiry.preferred_date}
                <div class="detail-row">
                  <span class="label">Preferred Date:</span>
                  <span class="value">
                    {format(new Date(enquiry.preferred_date), 'MMM dd, yyyy')}
                    {#if enquiry.preferred_time}
                      at {enquiry.preferred_time}
                    {/if}
                  </span>
                </div>
              {/if}
              
              {#if enquiry.assigned_to}
                <div class="detail-row">
                  <span class="label">Assigned to:</span>
                  <span class="value">{enquiry.assigned_to}</span>
                </div>
              {/if}
            </div>
            
            <div class="enquiry-message">
              <p>{enquiry.message}</p>
            </div>
            
            <div class="card-footer">
              <span class="status-badge {getStatusColor(enquiry.status)}">
                {enquiry.status}
              </span>
              <span class="timestamp">
                <Clock size={14} />
                {format(new Date(enquiry.created_at), 'MMM dd, HH:mm')}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<NewEnquiryModal 
  bind:show={showNewEnquiryModal} 
  on:enquiry-added={handleNewEnquiry}
  on:close={() => showNewEnquiryModal = false}
/>

<PatientRegistrationModal
  enquiryData={selectedEnquiry}
  open={showCompleteModal}
  userRole={userRole}
  on:close={handleCloseCompleteModal}
/>

<style>
  .enquiry-container {
    padding: 1.5rem;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }
  
  .header-left h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .header-left p {
    color: #6b7280;
    margin: 0;
  }
  
  .add-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .add-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  
  .search-box {
    position: relative;
    flex: 1;
    min-width: 300px;
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  
  .search-box input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .filter-group {
    display: flex;
    gap: 0.75rem;
  }
  
  .filter-select {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
  }
  
  .filter-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #374151;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  
  .filter-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .content-area {
    min-height: 400px;
  }
  
  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .empty-state h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .empty-state p {
    color: #6b7280;
    margin: 0;
  }
  
  .enquiries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .enquiry-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .enquiry-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .enquiry-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .enquiry-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    color: #3b82f6;
    font-weight: 600;
  }
  
  .enquiry-type {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .priority-high {
    background: #fecaca;
    color: #991b1b;
  }
  
  .priority-medium {
    background: #fed7aa;
    color: #9a3412;
  }
  
  .priority-low {
    background: #d1fae5;
    color: #065f46;
  }
  
  .action-menu-container {
    position: relative;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  
  .action-button:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .three-dots {
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
  }
  
  .action-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 1000;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: #374151;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    text-align: left;
  }
  
  .menu-item:hover {
    background: #f3f4f6;
  }
  
  .menu-item.danger {
    color: #dc2626;
  }
  
  .menu-item.danger:hover {
    background: #fef2f2;
  }
  
  .menu-divider {
    margin: 0;
    border: none;
    border-top: 1px solid #e5e7eb;
  }
  
  .patient-info {
    padding: 0 1rem 0.5rem 1rem;
  }
  
  .patient-info h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .enquiry-details {
    padding: 0 1rem 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }
  
  .detail-row .label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .detail-row .value {
    font-size: 0.875rem;
    color: #111827;
    font-weight: 500;
  }
  
  .enquiry-message {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .enquiry-message p {
    font-size: 0.875rem;
    color: #374151;
    margin: 0;
    line-height: 1.5;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f9fafb;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }
  
  .status-pending {
    background: #fef3c7;
    color: #92400e;
  }
  
  .status-contacted {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .status-scheduled {
    background: #e0e7ff;
    color: #3730a3;
  }
  
  .status-converted {
    background: #d1fae5;
    color: #065f46;
  }
  
  .status-cancelled {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .status-completed {
    background: #e0ffe0;
    color: #388e3c;
  }
  
  .status-default {
    background: #f3f4f6;
    color: #374151;
  }
  
  .timestamp {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  @media (max-width: 768px) {
    .enquiries-grid {
      grid-template-columns: 1fr;
    }
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    
    .filters {
      flex-direction: column;
    }
    
    .filter-group {
      flex-wrap: wrap;
    }
  }
</style>