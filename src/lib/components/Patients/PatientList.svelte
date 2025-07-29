<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-svelte'
  import { format } from 'date-fns'
  
  interface Patient {
    id: string
    patient_id: string
    full_name: string
    date_of_birth: string
    gender: string
    phone: string
    email: string | null
    status: string
    created_at: string
  }
  
  let patients: Patient[] = []
  let loading = true
  let searchTerm = ''
  let statusFilter = 'all'
  let showActionMenu: string | null = null

  // Mock data for demo mode
  const mockPatients: Patient[] = [
    {
      id: '1',
      patient_id: 'HMS001',
      full_name: 'Sarah Johnson',
      date_of_birth: '1985-03-15',
      gender: 'female',
      phone: '+1234567890',
      email: 'sarah.johnson@email.com',
      status: 'admitted',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      patient_id: 'HMS002',
      full_name: 'Michael Chen',
      date_of_birth: '1978-07-22',
      gender: 'male',
      phone: '+1234567891',
      email: 'michael.chen@email.com',
      status: 'registered',
      created_at: '2024-01-16T14:30:00Z'
    },
    {
      id: '3',
      patient_id: 'HMS003',
      full_name: 'Emily Rodriguez',
      date_of_birth: '1992-11-08',
      gender: 'female',
      phone: '+1234567892',
      email: 'emily.rodriguez@email.com',
      status: 'enquiry',
      created_at: '2024-01-17T09:15:00Z'
    },
    {
      id: '4',
      patient_id: 'HMS004',
      full_name: 'David Thompson',
      date_of_birth: '1965-05-30',
      gender: 'male',
      phone: '+1234567893',
      email: null,
      status: 'discharged',
      created_at: '2024-01-18T16:45:00Z'
    },
    {
      id: '5',
      patient_id: 'HMS005',
      full_name: 'Amanda White',
      date_of_birth: '1990-09-12',
      gender: 'female',
      phone: '+1234567894',
      email: 'amanda.white@email.com',
      status: 'admitted',
      created_at: '2024-01-19T11:20:00Z'
    }
  ]
  
  const statusOptions = [
    { value: 'all', label: 'All Patients' },
    { value: 'enquiry', label: 'Enquiry' },
    { value: 'registered', label: 'Registered' },
    { value: 'admitted', label: 'Admitted' },
    { value: 'discharged', label: 'Discharged' }
  ]
  
  $: filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  onMount(async () => {
    await loadPatients()
  })
  
  async function loadPatients() {
    try {
      if (isDemoMode) {
        // Simulate loading delay for demo
        await new Promise(resolve => setTimeout(resolve, 1500))
        patients = mockPatients
      } else {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        patients = data || []
      }
    } catch (error) {
      console.error('Error loading patients:', error)
      // Fallback to empty array on error
      patients = []
    } finally {
      loading = false
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'enquiry': return 'status-enquiry'
      case 'registered': return 'status-registered'
      case 'admitted': return 'status-admitted'
      case 'discharged': return 'status-discharged'
      default: return 'status-default'
    }
  }
  
  function calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }
  
  function toggleActionMenu(patientId: string) {
    showActionMenu = showActionMenu === patientId ? null : patientId
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.action-menu-container')) {
      showActionMenu = null
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="patient-list-container">
  <div class="list-header">
    <div class="header-left">
      <h2>Patient Management</h2>
      <p>Manage patient records and information</p>
    </div>
    <button class="add-button">
      <Plus size={20} />
      Add New Patient
    </button>
  </div>
  
  <div class="filters">
    <div class="search-box">
      <Search class="search-icon" size={20} />
      <input
        type="text"
        placeholder="Search patients by name, ID, or phone..."
        bind:value={searchTerm}
      />
    </div>
    
    <div class="filter-group">
      <select bind:value={statusFilter} class="status-filter">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      
      <button class="filter-button">
        <Filter size={20} />
        More Filters
      </button>
    </div>
  </div>
  
  <div class="table-container">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading patients...</p>
      </div>
    {:else if filteredPatients.length === 0}
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No patients found</h3>
        <p>
          {#if searchTerm || statusFilter !== 'all'}
            Try adjusting your search or filters
          {:else}
            Start by adding your first patient
          {/if}
        </p>
      </div>
    {:else}
      <table class="patients-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Age/Gender</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredPatients as patient}
            <tr>
              <td>
                <span class="patient-id">{patient.patient_id}</span>
              </td>
              <td>
                <div class="patient-name">
                  <span class="name">{patient.full_name}</span>
                </div>
              </td>
              <td>
                <div class="age-gender">
                  <span class="age">{calculateAge(patient.date_of_birth)} years</span>
                  <span class="gender">{patient.gender}</span>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <span class="phone">{patient.phone}</span>
                  {#if patient.email}
                    <span class="email">{patient.email}</span>
                  {/if}
                </div>
              </td>
              <td>
                <span class="status-badge {getStatusColor(patient.status)}">
                  {patient.status}
                </span>
              </td>
              <td>
                <span class="date">
                  {format(new Date(patient.created_at), 'MMM dd, yyyy')}
                </span>
              </td>
              <td>
                <div class="action-menu-container">
                  <button 
                    class="action-button"
                    on:click={() => toggleActionMenu(patient.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {#if showActionMenu === patient.id}
                    <div class="action-menu">
                      <button class="menu-item">
                        <Eye size={16} />
                        View Details
                      </button>
                      <button class="menu-item">
                        <Edit size={16} />
                        Edit Patient
                      </button>
                      <hr class="menu-divider" />
                      <button class="menu-item danger">
                        <Trash2 size={16} />
                        Delete Patient
                      </button>
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .patient-list-container {
    padding: 1.5rem;
  }
  
  .list-header {
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
  
  .status-filter {
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
  
  .table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
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
  
  .patients-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .patients-table th {
    background: #f9fafb;
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .patients-table td {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }
  
  .patients-table tr:hover {
    background: #f9fafb;
  }
  
  .patient-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    color: #3b82f6;
    font-weight: 600;
  }
  
  .patient-name .name {
    font-weight: 600;
    color: #111827;
  }
  
  .age-gender {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .age {
    font-weight: 500;
    color: #111827;
    font-size: 0.875rem;
  }
  
  .gender {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: capitalize;
  }
  
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .phone {
    font-weight: 500;
    color: #111827;
    font-size: 0.875rem;
  }
  
  .email {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-enquiry {
    background: #fef3c7;
    color: #92400e;
  }

  .status-registered {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-admitted {
    background: #d1fae5;
    color: #065f46;
  }

  .status-discharged {
    background: #f3f4f6;
    color: #374151;
  }

  .status-default {
    background: #f3f4f6;
    color: #374151;
  }
  
  .date {
    font-size: 0.875rem;
    color: #6b7280;
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
  
  .action-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    min-width: 160px;
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
</style>