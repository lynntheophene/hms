<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { Receipt, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, CreditCard, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-svelte'
  import { format } from 'date-fns'
  
  interface Bill {
    id: string
    bill_id: string
    patient_name: string
    patient_id: string
    bill_date: string
    due_date: string
    total_amount: number
    paid_amount: number
    outstanding_amount: number
    status: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
    payment_method?: string
    discount_amount: number
    tax_amount: number
    department: string
    doctor_name?: string
    items: BillItem[]
    notes?: string
    created_by: string
  }
  
  interface BillItem {
    id: string
    description: string
    quantity: number
    unit_price: number
    total_price: number
    category: string
  }
  
  interface Payment {
    id: string
    bill_id: string
    payment_date: string
    amount: number
    payment_method: string
    reference_number?: string
    notes?: string
    processed_by: string
  }
  
  let bills: Bill[] = []
  let payments: Payment[] = []
  let loading = true
  let searchTerm = ''
  let statusFilter = 'all'
  let departmentFilter = 'all'
  let showActionMenu: string | null = null
  let selectedTab = 'bills' // bills | payments | reports
  
  // Mock data for demo mode
  const mockBills: Bill[] = [
    {
      id: '1',
      bill_id: 'BILL001',
      patient_name: 'Sarah Johnson',
      patient_id: 'HMS001',
      bill_date: '2024-01-20',
      due_date: '2024-02-20',
      total_amount: 2150.00,
      paid_amount: 1000.00,
      outstanding_amount: 1150.00,
      status: 'partially_paid',
      discount_amount: 0,
      tax_amount: 150.00,
      department: 'Cardiology',
      doctor_name: 'Dr. Michael Chen',
      items: [
        { id: '1', description: 'Consultation Fee', quantity: 1, unit_price: 200.00, total_price: 200.00, category: 'Consultation' },
        { id: '2', description: 'ECG Test', quantity: 1, unit_price: 150.00, total_price: 150.00, category: 'Diagnostic' },
        { id: '3', description: 'Room Charges (3 days)', quantity: 3, unit_price: 300.00, total_price: 900.00, category: 'Accommodation' },
        { id: '4', description: 'Medicines', quantity: 1, unit_price: 500.00, total_price: 500.00, category: 'Pharmacy' },
        { id: '5', description: 'Lab Tests', quantity: 2, unit_price: 75.00, total_price: 150.00, category: 'Laboratory' }
      ],
      notes: 'Patient discharge bill',
      created_by: 'Finance Team'
    },
    {
      id: '2',
      bill_id: 'BILL002',
      patient_name: 'Robert Brown',
      patient_id: 'HMS003',
      bill_date: '2024-01-19',
      due_date: '2024-02-19',
      total_amount: 450.00,
      paid_amount: 450.00,
      outstanding_amount: 0,
      status: 'paid',
      payment_method: 'Credit Card',
      discount_amount: 50.00,
      tax_amount: 50.00,
      department: 'Emergency',
      doctor_name: 'Dr. Sarah Wilson',
      items: [
        { id: '6', description: 'Emergency Consultation', quantity: 1, unit_price: 250.00, total_price: 250.00, category: 'Emergency' },
        { id: '7', description: 'X-Ray Chest', quantity: 1, unit_price: 120.00, total_price: 120.00, category: 'Radiology' },
        { id: '8', description: 'Basic Medications', quantity: 1, unit_price: 80.00, total_price: 80.00, category: 'Pharmacy' }
      ],
      created_by: 'Finance Team'
    },
    {
      id: '3',
      bill_id: 'BILL003',
      patient_name: 'Emily Rodriguez',
      patient_id: 'HMS003',
      bill_date: '2024-01-18',
      due_date: '2024-01-25',
      total_amount: 1200.00,
      paid_amount: 0,
      outstanding_amount: 1200.00,
      status: 'overdue',
      discount_amount: 0,
      tax_amount: 120.00,
      department: 'Surgery',
      doctor_name: 'Dr. John Smith',
      items: [
        { id: '9', description: 'Surgical Procedure', quantity: 1, unit_price: 800.00, total_price: 800.00, category: 'Surgery' },
        { id: '10', description: 'Anesthesia', quantity: 1, unit_price: 200.00, total_price: 200.00, category: 'Surgery' },
        { id: '11', description: 'Post-op Care', quantity: 1, unit_price: 80.00, total_price: 80.00, category: 'Nursing' }
      ],
      notes: 'Payment reminder sent',
      created_by: 'Finance Team'
    }
  ]
  
  const mockPayments: Payment[] = [
    {
      id: '1',
      bill_id: '1',
      payment_date: '2024-01-20T14:30:00Z',
      amount: 1000.00,
      payment_method: 'Credit Card',
      reference_number: 'CC001234',
      notes: 'Partial payment',
      processed_by: 'Sarah Admin'
    },
    {
      id: '2',
      bill_id: '2',
      payment_date: '2024-01-19T16:45:00Z',
      amount: 450.00,
      payment_method: 'Cash',
      reference_number: 'CASH001',
      notes: 'Full payment',
      processed_by: 'John Receptionist'
    }
  ]
  
  const departments = [
    'Cardiology', 'Emergency', 'Surgery', 'General Medicine', 'Pediatrics',
    'Orthopedics', 'Neurology', 'Radiology', 'Laboratory', 'Pharmacy'
  ]
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ]
  
  $: filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.bill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || bill.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })
  
  $: filteredPayments = payments.filter(payment => {
    const associatedBill = bills.find(b => b.id === payment.bill_id)
    return associatedBill && (
      associatedBill.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      associatedBill.bill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })
  
  onMount(async () => {
    await loadData()
  })
  
  async function loadData() {
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        bills = mockBills
        payments = mockPayments
      } else {
        const [billsResult, paymentsResult] = await Promise.all([
          supabase.from('bills').select('*, bill_items(*)').order('bill_date', { ascending: false }),
          supabase.from('payments').select('*').order('payment_date', { ascending: false })
        ])
        
        if (billsResult.error) throw billsResult.error
        if (paymentsResult.error) throw paymentsResult.error
        
        bills = billsResult.data || []
        payments = paymentsResult.data || []
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
      bills = []
      payments = []
    } finally {
      loading = false
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'draft': return 'status-draft'
      case 'pending': return 'status-pending'
      case 'partially_paid': return 'status-partial'
      case 'paid': return 'status-paid'
      case 'overdue': return 'status-overdue'
      case 'cancelled': return 'status-cancelled'
      default: return 'status-default'
    }
  }
  
  function getStatusIcon(status: string) {
    switch (status) {
      case 'draft': return Edit
      case 'pending': return Clock
      case 'partially_paid': return CreditCard
      case 'paid': return CheckCircle
      case 'overdue': return AlertCircle
      case 'cancelled': return Trash2
      default: return Receipt
    }
  }
  
  function toggleActionMenu(billId: string) {
    showActionMenu = showActionMenu === billId ? null : billId
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.action-menu-container')) {
      showActionMenu = null
    }
  }
  
  async function updateBillStatus(billId: string, newStatus: string) {
    try {
      if (isDemoMode) {
        const index = bills.findIndex(b => b.id === billId)
        if (index !== -1) {
          bills[index].status = newStatus as any
          bills = [...bills]
        }
      } else {
        const { error } = await supabase
          .from('bills')
          .update({ status: newStatus })
          .eq('id', billId)
        
        if (error) throw error
        await loadData()
      }
      showActionMenu = null
    } catch (error) {
      console.error('Error updating bill status:', error)
    }
  }
  
  // Calculate billing statistics
  $: billingStats = {
    totalBills: bills.length,
    totalRevenue: bills.reduce((total, b) => total + b.total_amount, 0),
    totalPaid: bills.reduce((total, b) => total + b.paid_amount, 0),
    totalOutstanding: bills.reduce((total, b) => total + b.outstanding_amount, 0),
    overdueBills: bills.filter(b => b.status === 'overdue').length
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="billing-container">
  <div class="page-header">
    <div class="header-left">
      <h2>Billing & Finance</h2>
      <p>Manage patient bills and payments</p>
    </div>
    <button class="add-button">
      <Plus size={20} />
      Create Bill
    </button>
  </div>
  
  <!-- Statistics Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon total">
        <Receipt size={24} />
      </div>
      <div class="stat-content">
        <h3>{billingStats.totalBills}</h3>
        <p>Total Bills</p>
      </div>
    </div>
    
    <div class="stat-card highlight">
      <div class="stat-content">
        <h3>${billingStats.totalRevenue.toFixed(2)}</h3>
        <p>Total Revenue</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon paid">
        <CheckCircle size={24} />
      </div>
      <div class="stat-content">
        <h3>${billingStats.totalPaid.toFixed(2)}</h3>
        <p>Total Paid</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon outstanding">
        <DollarSign size={24} />
      </div>
      <div class="stat-content">
        <h3>${billingStats.totalOutstanding.toFixed(2)}</h3>
        <p>Outstanding</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon overdue">
        <AlertCircle size={24} />
      </div>
      <div class="stat-content">
        <h3>{billingStats.overdueBills}</h3>
        <p>Overdue Bills</p>
      </div>
    </div>
  </div>
  
  <!-- Tabs -->
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={selectedTab === 'bills'}
      on:click={() => selectedTab = 'bills'}
    >
      <Receipt size={16} />
      Bills
    </button>
    <button 
      class="tab-button" 
      class:active={selectedTab === 'payments'}
      on:click={() => selectedTab = 'payments'}
    >
      <CreditCard size={16} />
      Payments
    </button>
  </div>
  
  <!-- Filters -->
  <div class="filters">
    <div class="search-box">
      <Search class="search-icon" size={20} />
      <input
        type="text"
        placeholder={selectedTab === 'bills' ? 
          'Search by patient, bill ID, or patient ID...' : 
          'Search payments by patient or reference...'
        }
        bind:value={searchTerm}
      />
    </div>
    
    {#if selectedTab === 'bills'}
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
    {/if}
  </div>
  
  <!-- Content Area -->
  <div class="content-area">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading billing data...</p>
      </div>
    {:else if selectedTab === 'bills'}
      {#if filteredBills.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🧾</div>
          <h3>No bills found</h3>
          <p>
            {#if searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'}
              Try adjusting your search or filters
            {:else}
              No bills generated yet
            {/if}
          </p>
        </div>
      {:else}
        <div class="bills-grid">
          {#each filteredBills as bill}
            <div class="bill-card">
              <div class="bill-header">
                <div class="bill-info">
                  <div class="bill-id-status">
                    <span class="bill-id">{bill.bill_id}</span>
                    <span class="status-badge {getStatusColor(bill.status)}">
                      <svelte:component this={getStatusIcon(bill.status)} size={14} />
                      {bill.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4>{bill.patient_name}</h4>
                  <span class="department">{bill.department}</span>
                </div>
                
                <div class="action-menu-container">
                  <button 
                    class="action-button"
                    on:click={() => toggleActionMenu(bill.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {#if showActionMenu === bill.id}
                    <div class="action-menu">
                      <button class="menu-item">
                        <Eye size={16} />
                        View Details
                      </button>
                      <button class="menu-item">
                        <CreditCard size={16} />
                        Record Payment
                      </button>
                      <button class="menu-item">
                        <Edit size={16} />
                        Edit Bill
                      </button>
                      <hr class="menu-divider" />
                      <button class="menu-item" on:click={() => updateBillStatus(bill.id, 'paid')}>
                        <CheckCircle size={16} />
                        Mark as Paid
                      </button>
                      <button class="menu-item danger" on:click={() => updateBillStatus(bill.id, 'cancelled')}>
                        <Trash2 size={16} />
                        Cancel Bill
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
              
              <div class="bill-amounts">
                <div class="amount-row total">
                  <span class="label">Total Amount:</span>
                  <span class="value">${bill.total_amount.toFixed(2)}</span>
                </div>
                <div class="amount-row paid">
                  <span class="label">Paid:</span>
                  <span class="value">${bill.paid_amount.toFixed(2)}</span>
                </div>
                <div class="amount-row outstanding">
                  <span class="label">Outstanding:</span>
                  <span class="value">${bill.outstanding_amount.toFixed(2)}</span>
                </div>
                {#if bill.discount_amount > 0}
                  <div class="amount-row discount">
                    <span class="label">Discount:</span>
                    <span class="value">-${bill.discount_amount.toFixed(2)}</span>
                  </div>
                {/if}
              </div>
              
              <div class="bill-details">
                <div class="detail-row">
                  <span class="label">Patient ID:</span>
                  <span class="value">{bill.patient_id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Bill Date:</span>
                  <span class="value">{format(new Date(bill.bill_date), 'MMM dd, yyyy')}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Due Date:</span>
                  <span class="value">{format(new Date(bill.due_date), 'MMM dd, yyyy')}</span>
                </div>
                {#if bill.doctor_name}
                  <div class="detail-row">
                    <span class="label">Doctor:</span>
                    <span class="value">{bill.doctor_name}</span>
                  </div>
                {/if}
              </div>
              
              <div class="bill-items">
                <h5>Bill Items ({bill.items.length})</h5>
                <div class="items-list">
                  {#each bill.items.slice(0, 3) as item}
                    <div class="item-row">
                      <span class="item-desc">{item.description}</span>
                      <span class="item-amount">${item.total_price.toFixed(2)}</span>
                    </div>
                  {/each}
                  {#if bill.items.length > 3}
                    <div class="item-row more">
                      <span class="item-desc">+ {bill.items.length - 3} more items</span>
                    </div>
                  {/if}
                </div>
              </div>
              
              {#if bill.notes}
                <div class="bill-notes">
                  <p>{bill.notes}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {:else if selectedTab === 'payments'}
      {#if filteredPayments.length === 0}
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <h3>No payments found</h3>
          <p>No payments recorded yet</p>
        </div>
      {:else}
        <div class="payments-list">
          {#each filteredPayments as payment}
            {@const associatedBill = bills.find(b => b.id === payment.bill_id)}
            {#if associatedBill}
              <div class="payment-card">
                <div class="payment-header">
                  <div class="payment-info">
                    <h4>{associatedBill.patient_name}</h4>
                    <span class="bill-ref">Bill: {associatedBill.bill_id}</span>
                  </div>
                  <div class="payment-amount">
                    <span class="amount">${payment.amount.toFixed(2)}</span>
                    <span class="method">{payment.payment_method}</span>
                  </div>
                </div>
                
                <div class="payment-details">
                  <div class="detail-row">
                    <span class="label">Payment Date:</span>
                    <span class="value">{format(new Date(payment.payment_date), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  {#if payment.reference_number}
                    <div class="detail-row">
                      <span class="label">Reference:</span>
                      <span class="value">{payment.reference_number}</span>
                    </div>
                  {/if}
                  <div class="detail-row">
                    <span class="label">Processed by:</span>
                    <span class="value">{payment.processed_by}</span>
                  </div>
                </div>
                
                {#if payment.notes}
                  <div class="payment-notes">
                    <p>{payment.notes}</p>
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .billing-container {
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
    background: linear-gradient(135deg, #059669, #047857);
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
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
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
    background: linear-gradient(135deg, #059669, #047857);
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
  .stat-icon.paid { background: #10b981; }
  .stat-icon.outstanding { background: #f59e0b; }
  .stat-icon.overdue { background: #ef4444; }
  
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
    color: #059669;
    border-bottom-color: #059669;
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
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
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
    border-top: 3px solid #059669;
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
  
  .bills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .bill-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .bill-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .bill-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .bill-id-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .bill-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    color: #059669;
    font-weight: 600;
  }
  
  .status-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    text-transform: capitalize;
  }
  
  .status-draft { background: #f3f4f6; color: #374151; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-partial { background: #dbeafe; color: #1e40af; }
  .status-paid { background: #d1fae5; color: #065f46; }
  .status-overdue { background: #fecaca; color: #991b1b; }
  .status-cancelled { background: #f3f4f6; color: #6b7280; }
  
  .bill-info h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .department {
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
  
  .bill-amounts {
    padding: 0 1rem 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .amount-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }
  
  .amount-row.total {
    font-weight: 700;
    font-size: 1rem;
    color: #111827;
  }
  
  .amount-row.paid .value {
    color: #059669;
    font-weight: 600;
  }
  
  .amount-row.outstanding .value {
    color: #dc2626;
    font-weight: 600;
  }
  
  .amount-row.discount .value {
    color: #8b5cf6;
    font-weight: 600;
  }
  
  .amount-row .label {
    color: #6b7280;
    font-weight: 500;
  }
  
  .bill-details {
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
  
  .bill-items {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .bill-items h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .item-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.125rem;
    font-size: 0.875rem;
  }
  
  .item-desc {
    color: #374151;
  }
  
  .item-amount {
    color: #111827;
    font-weight: 500;
  }
  
  .item-row.more .item-desc {
    color: #6b7280;
    font-style: italic;
  }
  
  .bill-notes {
    padding: 0.5rem 1rem 1rem 1rem;
    background: #f9fafb;
  }
  
  .bill-notes p {
    font-size: 0.875rem;
    color: #374151;
    margin: 0;
    font-style: italic;
  }
  
  .payments-list {
    display: grid;
    gap: 1rem;
  }
  
  .payment-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .payment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .payment-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .bill-ref {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .payment-amount {
    text-align: right;
  }
  
  .payment-amount .amount {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #059669;
    margin-bottom: 0.125rem;
  }
  
  .payment-amount .method {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .payment-details {
    padding: 0 1rem 0.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .payment-notes {
    padding: 0.5rem 1rem 1rem 1rem;
    background: #f9fafb;
  }
  
  .payment-notes p {
    font-size: 0.875rem;
    color: #374151;
    margin: 0;
    font-style: italic;
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
    
    .bills-grid {
      grid-template-columns: 1fr;
    }
  }
</style>