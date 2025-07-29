<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { TestTube, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, FlaskConical } from 'lucide-svelte'
  import { format } from 'date-fns'
  
  interface LabTest {
    id: string
    test_id: string
    patient_name: string
    patient_id: string
    test_name: string
    test_category: string
    doctor_name: string
    sample_type: string
    collection_date: string
    test_date?: string
    result_date?: string
    status: 'pending' | 'collected' | 'processing' | 'completed' | 'reported'
    priority: 'normal' | 'urgent' | 'stat'
    results?: any
    notes?: string
    technician?: string
    cost: number
  }
  
  interface TestTemplate {
    id: string
    name: string
    category: string
    sample_type: string
    normal_range: string
    unit: string
    cost: number
    processing_time: number // in hours
    preparation_required: boolean
    preparation_instructions?: string
  }
  
  let labTests: LabTest[] = []
  let testTemplates: TestTemplate[] = []
  let loading = true
  let searchTerm = ''
  let statusFilter = 'all'
  let categoryFilter = 'all'
  let priorityFilter = 'all'
  let showActionMenu: string | null = null
  let selectedTab = 'tests' // tests | templates | reports
  
  // Mock data for demo mode
  const mockLabTests: LabTest[] = [
    {
      id: '1',
      test_id: 'LAB001',
      patient_name: 'Sarah Johnson',
      patient_id: 'HMS001',
      test_name: 'Complete Blood Count',
      test_category: 'Hematology',
      doctor_name: 'Dr. Michael Chen',
      sample_type: 'Blood',
      collection_date: '2024-01-20T09:00:00Z',
      test_date: '2024-01-20T10:30:00Z',
      status: 'processing',
      priority: 'normal',
      technician: 'Lab Tech A',
      cost: 45.00
    },
    {
      id: '2',
      test_id: 'LAB002',
      patient_name: 'Robert Brown',
      patient_id: 'HMS003',
      test_name: 'Blood Glucose',
      test_category: 'Biochemistry',
      doctor_name: 'Dr. Sarah Wilson',
      sample_type: 'Blood',
      collection_date: '2024-01-20T08:30:00Z',
      test_date: '2024-01-20T09:15:00Z',
      result_date: '2024-01-20T11:45:00Z',
      status: 'completed',
      priority: 'urgent',
      results: { glucose: 95, unit: 'mg/dL', reference: '70-110 mg/dL' },
      technician: 'Lab Tech B',
      cost: 25.00
    },
    {
      id: '3',
      test_id: 'LAB003',
      patient_name: 'Emily Rodriguez',
      patient_id: 'HMS003',
      test_name: 'Chest X-Ray',
      test_category: 'Radiology',
      doctor_name: 'Dr. John Smith',
      sample_type: 'Imaging',
      collection_date: '2024-01-19T14:00:00Z',
      result_date: '2024-01-19T16:30:00Z',
      status: 'reported',
      priority: 'normal',
      results: { findings: 'Normal chest X-ray. No acute abnormalities seen.' },
      technician: 'Radiologist C',
      cost: 120.00
    },
    {
      id: '4',
      test_id: 'LAB004',
      patient_name: 'David Thompson',
      patient_id: 'HMS004',
      test_name: 'Urine Analysis',
      test_category: 'Urinalysis',
      doctor_name: 'Dr. Sarah Wilson',
      sample_type: 'Urine',
      collection_date: '2024-01-20T07:00:00Z',
      status: 'collected',
      priority: 'normal',
      cost: 30.00
    }
  ]
  
  const mockTestTemplates: TestTemplate[] = [
    {
      id: '1',
      name: 'Complete Blood Count',
      category: 'Hematology',
      sample_type: 'Blood',
      normal_range: 'Various parameters',
      unit: 'Multiple',
      cost: 45.00,
      processing_time: 2,
      preparation_required: false
    },
    {
      id: '2',
      name: 'Blood Glucose',
      category: 'Biochemistry',
      sample_type: 'Blood',
      normal_range: '70-110',
      unit: 'mg/dL',
      cost: 25.00,
      processing_time: 1,
      preparation_required: true,
      preparation_instructions: 'Fasting for 8-12 hours required'
    },
    {
      id: '3',
      name: 'Chest X-Ray',
      category: 'Radiology',
      sample_type: 'Imaging',
      normal_range: 'No abnormalities',
      unit: 'Report',
      cost: 120.00,
      processing_time: 4,
      preparation_required: false
    }
  ]
  
  const categories = [
    'Hematology', 'Biochemistry', 'Microbiology', 'Pathology', 
    'Radiology', 'Urinalysis', 'Immunology', 'Endocrinology'
  ]
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'collected', label: 'Collected' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'reported', label: 'Reported' }
  ]
  
  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'stat', label: 'STAT' }
  ]
  
  $: filteredTests = labTests.filter(test => {
    const matchesSearch = test.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || test.test_category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || test.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })
  
  $: filteredTemplates = testTemplates.filter(template => {
    return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.category.toLowerCase().includes(searchTerm.toLowerCase())
  })
  
  onMount(async () => {
    await loadData()
  })
  
  async function loadData() {
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        labTests = mockLabTests
        testTemplates = mockTestTemplates
      } else {
        const [testsResult, templatesResult] = await Promise.all([
          supabase.from('lab_tests').select('*').order('collection_date', { ascending: false }),
          supabase.from('test_templates').select('*').order('name')
        ])
        
        if (testsResult.error) throw testsResult.error
        if (templatesResult.error) throw templatesResult.error
        
        labTests = testsResult.data || []
        testTemplates = templatesResult.data || []
      }
    } catch (error) {
      console.error('Error loading laboratory data:', error)
      labTests = []
      testTemplates = []
    } finally {
      loading = false
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'collected': return 'status-collected'
      case 'processing': return 'status-processing'
      case 'completed': return 'status-completed'
      case 'reported': return 'status-reported'
      default: return 'status-default'
    }
  }
  
  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'stat': return 'priority-stat'
      case 'urgent': return 'priority-urgent'
      case 'normal': return 'priority-normal'
      default: return 'priority-normal'
    }
  }
  
  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending': return Clock
      case 'collected': return FlaskConical
      case 'processing': return TestTube
      case 'completed': return CheckCircle
      case 'reported': return Eye
      default: return AlertCircle
    }
  }
  
  function toggleActionMenu(testId: string) {
    showActionMenu = showActionMenu === testId ? null : testId
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.action-menu-container')) {
      showActionMenu = null
    }
  }
  
  async function updateTestStatus(testId: string, newStatus: string) {
    try {
      if (isDemoMode) {
        const index = labTests.findIndex(t => t.id === testId)
        if (index !== -1) {
          labTests[index].status = newStatus as any
          if (newStatus === 'completed') {
            labTests[index].result_date = new Date().toISOString()
          }
          labTests = [...labTests]
        }
      } else {
        const updateData: any = { status: newStatus }
        if (newStatus === 'completed') {
          updateData.result_date = new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('lab_tests')
          .update(updateData)
          .eq('id', testId)
        
        if (error) throw error
        await loadData()
      }
      showActionMenu = null
    } catch (error) {
      console.error('Error updating test status:', error)
    }
  }
  
  // Calculate laboratory statistics
  $: labStats = {
    totalTests: labTests.length,
    pending: labTests.filter(t => t.status === 'pending').length,
    inProgress: labTests.filter(t => ['collected', 'processing'].includes(t.status)).length,
    completed: labTests.filter(t => t.status === 'completed').length,
    totalRevenue: labTests.reduce((total, t) => total + t.cost, 0)
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="laboratory-container">
  <div class="page-header">
    <div class="header-left">
      <h2>Laboratory Management</h2>
      <p>Manage lab tests, results, and reporting</p>
    </div>
    <button class="add-button">
      <Plus size={20} />
      New Lab Test
    </button>
  </div>
  
  <!-- Statistics Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon total">
        <TestTube size={24} />
      </div>
      <div class="stat-content">
        <h3>{labStats.totalTests}</h3>
        <p>Total Tests</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon pending">
        <Clock size={24} />
      </div>
      <div class="stat-content">
        <h3>{labStats.pending}</h3>
        <p>Pending</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon progress">
        <FlaskConical size={24} />
      </div>
      <div class="stat-content">
        <h3>{labStats.inProgress}</h3>
        <p>In Progress</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon completed">
        <CheckCircle size={24} />
      </div>
      <div class="stat-content">
        <h3>{labStats.completed}</h3>
        <p>Completed</p>
      </div>
    </div>
    
    <div class="stat-card highlight">
      <div class="stat-content">
        <h3>${labStats.totalRevenue.toFixed(2)}</h3>
        <p>Total Revenue</p>
      </div>
    </div>
  </div>
  
  <!-- Tabs -->
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={selectedTab === 'tests'}
      on:click={() => selectedTab = 'tests'}
    >
      <TestTube size={16} />
      Tests
    </button>
    <button 
      class="tab-button" 
      class:active={selectedTab === 'templates'}
      on:click={() => selectedTab = 'templates'}
    >
      <FlaskConical size={16} />
      Test Templates
    </button>
  </div>
  
  <!-- Filters -->
  <div class="filters">
    <div class="search-box">
      <Search class="search-icon" size={20} />
      <input
        type="text"
        placeholder={selectedTab === 'tests' ? 
          'Search by patient, test ID, or test name...' : 
          'Search test templates...'
        }
        bind:value={searchTerm}
      />
    </div>
    
    {#if selectedTab === 'tests'}
      <div class="filter-group">
        <select bind:value={statusFilter} class="filter-select">
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        
        <select bind:value={categoryFilter} class="filter-select">
          <option value="all">All Categories</option>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        
        <select bind:value={priorityFilter} class="filter-select">
          {#each priorityOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        
        <button class="filter-button">
          <Filter size={20} />
          More Filters
        </button>
      </div>
    {/if}
  </div>
  
  <!-- Content Area -->
  <div class="content-area">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading laboratory data...</p>
      </div>
    {:else if selectedTab === 'tests'}
      {#if filteredTests.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🧪</div>
          <h3>No tests found</h3>
          <p>
            {#if searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'}
              Try adjusting your search or filters
            {:else}
              No lab tests scheduled yet
            {/if}
          </p>
        </div>
      {:else}
        <div class="tests-grid">
          {#each filteredTests as test}
            <div class="test-card">
              <div class="test-header">
                <div class="test-info">
                  <div class="test-id-priority">
                    <span class="test-id">{test.test_id}</span>
                    <span class="priority-badge {getPriorityColor(test.priority)}">
                      {test.priority.toUpperCase()}
                    </span>
                  </div>
                  <h4>{test.test_name}</h4>
                  <span class="test-category">{test.test_category}</span>
                </div>
                
                <div class="test-status">
                  <div class="status-indicator">
                    <svelte:component this={getStatusIcon(test.status)} size={16} />
                    <span class="status-text {getStatusColor(test.status)}">
                      {test.status}
                    </span>
                  </div>
                  
                  <div class="action-menu-container">
                    <button 
                      class="action-button"
                      on:click={() => toggleActionMenu(test.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {#if showActionMenu === test.id}
                      <div class="action-menu">
                        <button class="menu-item" on:click={() => updateTestStatus(test.id, 'collected')}>
                          <FlaskConical size={16} />
                          Mark Collected
                        </button>
                        <button class="menu-item" on:click={() => updateTestStatus(test.id, 'processing')}>
                          <TestTube size={16} />
                          Start Processing
                        </button>
                        <button class="menu-item" on:click={() => updateTestStatus(test.id, 'completed')}>
                          <CheckCircle size={16} />
                          Mark Completed
                        </button>
                        <button class="menu-item">
                          <Eye size={16} />
                          View Results
                        </button>
                        <hr class="menu-divider" />
                        <button class="menu-item">
                          <Edit size={16} />
                          Edit Test
                        </button>
                        <button class="menu-item danger">
                          <Trash2 size={16} />
                          Cancel Test
                        </button>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <div class="patient-info">
                <h5>Patient Information</h5>
                <div class="patient-details">
                  <span class="patient-name">{test.patient_name}</span>
                  <span class="patient-id">ID: {test.patient_id}</span>
                </div>
                <div class="doctor-info">
                  <span class="doctor-label">Ordered by:</span>
                  <span class="doctor-name">{test.doctor_name}</span>
                </div>
              </div>
              
              <div class="test-details">
                <div class="detail-row">
                  <span class="label">Sample Type:</span>
                  <span class="value">{test.sample_type}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Collection Date:</span>
                  <span class="value">{format(new Date(test.collection_date), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {#if test.test_date}
                  <div class="detail-row">
                    <span class="label">Test Date:</span>
                    <span class="value">{format(new Date(test.test_date), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                {/if}
                {#if test.result_date}
                  <div class="detail-row">
                    <span class="label">Result Date:</span>
                    <span class="value">{format(new Date(test.result_date), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                {/if}
                {#if test.technician}
                  <div class="detail-row">
                    <span class="label">Technician:</span>
                    <span class="value">{test.technician}</span>
                  </div>
                {/if}
              </div>
              
              {#if test.results}
                <div class="test-results">
                  <h5>Results</h5>
                  {#if typeof test.results === 'object'}
                    {#each Object.entries(test.results) as [key, value]}
                      <div class="result-item">
                        <span class="result-key">{key}:</span>
                        <span class="result-value">{value}</span>
                      </div>
                    {/each}
                  {:else}
                    <p>{test.results}</p>
                  {/if}
                </div>
              {/if}
              
              <div class="test-footer">
                <span class="test-cost">${test.cost.toFixed(2)}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else if selectedTab === 'templates'}
      {#if filteredTemplates.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🧪</div>
          <h3>No test templates found</h3>
          <p>No test templates configured yet</p>
        </div>
      {:else}
        <div class="templates-grid">
          {#each filteredTemplates as template}
            <div class="template-card">
              <div class="template-header">
                <h4>{template.name}</h4>
                <span class="template-category">{template.category}</span>
              </div>
              
              <div class="template-details">
                <div class="detail-row">
                  <span class="label">Sample Type:</span>
                  <span class="value">{template.sample_type}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Normal Range:</span>
                  <span class="value">{template.normal_range} {template.unit}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Processing Time:</span>
                  <span class="value">{template.processing_time} hours</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cost:</span>
                  <span class="value cost">${template.cost.toFixed(2)}</span>
                </div>
              </div>
              
              {#if template.preparation_required}
                <div class="preparation-info">
                  <h5>Preparation Required</h5>
                  <p>{template.preparation_instructions || 'Special preparation required'}</p>
                </div>
              {/if}
              
              <div class="template-actions">
                <button class="action-btn primary">Use Template</button>
                <button class="action-btn secondary">Edit</button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .laboratory-container {
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
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .stat-card.highlight {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    flex-direction: column;
    align-items: stretch;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .stat-icon.total { background: #6366f1; }
  .stat-icon.pending { background: #f59e0b; }
  .stat-icon.progress { background: #3b82f6; }
  .stat-icon.completed { background: #10b981; }
  
  .stat-content h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: inherit;
  }
  
  .stat-content p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
  
  .stat-card.highlight .stat-content p {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }
  
  .tab-button.active {
    color: #8b5cf6;
    border-bottom-color: #8b5cf6;
  }
  
  .tab-button:hover {
    color: #374151;
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
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
    border-top: 3px solid #8b5cf6;
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
  
  .tests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .test-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .test-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .test-id-priority {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .test-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    color: #8b5cf6;
    font-weight: 600;
  }
  
  .priority-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.125rem 0.375rem;
    border-radius: 8px;
    text-transform: uppercase;
  }
  
  .priority-normal {
    background: #d1fae5;
    color: #065f46;
  }
  
  .priority-urgent {
    background: #fed7aa;
    color: #9a3412;
  }
  
  .priority-stat {
    background: #fecaca;
    color: #991b1b;
  }
  
  .test-info h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .test-category {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .test-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .status-text {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }
  
  .status-pending { color: #f59e0b; }
  .status-collected { color: #3b82f6; }
  .status-processing { color: #8b5cf6; }
  .status-completed { color: #10b981; }
  .status-reported { color: #059669; }
  
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
    border-bottom: 1px solid #f3f4f6;
  }
  
  .patient-info h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .patient-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }
  
  .patient-name {
    font-weight: 600;
    color: #111827;
  }
  
  .patient-id {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .doctor-info {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
  
  .doctor-label {
    color: #6b7280;
  }
  
  .doctor-name {
    color: #111827;
    font-weight: 500;
  }
  
  .test-details {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.125rem;
    font-size: 0.875rem;
  }
  
  .detail-row .label {
    color: #6b7280;
    font-weight: 500;
  }
  
  .detail-row .value {
    color: #111827;
    font-weight: 500;
  }
  
  .test-results {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    background: #f9fafb;
  }
  
  .test-results h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .result-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.125rem;
    font-size: 0.875rem;
  }
  
  .result-key {
    color: #6b7280;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .result-value {
    color: #111827;
    font-weight: 600;
  }
  
  .test-footer {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    text-align: right;
  }
  
  .test-cost {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
  }
  
  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .template-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .template-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .template-header {
    padding: 1rem 1rem 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .template-header h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .template-category {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .template-details {
    padding: 0.5rem 1rem;
  }
  
  .template-details .detail-row .value.cost {
    font-weight: 700;
    color: #8b5cf6;
  }
  
  .preparation-info {
    padding: 0.5rem 1rem;
    background: #fef3c7;
    border-top: 1px solid #f3f4f6;
  }
  
  .preparation-info h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 0.25rem 0;
  }
  
  .preparation-info p {
    font-size: 0.875rem;
    color: #92400e;
    margin: 0;
  }
  
  .template-actions {
    padding: 1rem;
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    flex: 1;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-btn.primary {
    background: #8b5cf6;
    color: white;
    border: none;
  }
  
  .action-btn.primary:hover {
    background: #7c3aed;
  }
  
  .action-btn.secondary {
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
  }
  
  .action-btn.secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  @media (max-width: 768px) {
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
    
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .tests-grid,
    .templates-grid {
      grid-template-columns: 1fr;
    }
  }
</style>