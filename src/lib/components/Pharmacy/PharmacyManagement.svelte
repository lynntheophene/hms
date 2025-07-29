<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { Pill, Plus, Search, Filter, MoreVertical, Edit, Trash2, AlertTriangle, Package, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-svelte'
  import { format } from 'date-fns'
  
  interface Medicine {
    id: string
    medicine_id: string
    name: string
    generic_name: string
    manufacturer: string
    category: string
    dosage_form: string
    strength: string
    unit_price: number
    stock_quantity: number
    reorder_level: number
    expiry_date: string
    batch_number: string
    supplier: string
    status: 'active' | 'inactive' | 'discontinued'
    created_at: string
    updated_at: string
  }
  
  interface StockTransaction {
    id: string
    medicine_id: string
    medicine_name: string
    transaction_type: 'in' | 'out' | 'adjustment'
    quantity: number
    unit_price: number
    total_amount: number
    reference_id?: string
    notes?: string
    created_at: string
    created_by: string
  }
  
  let medicines: Medicine[] = []
  let transactions: StockTransaction[] = []
  let loading = true
  let searchTerm = ''
  let categoryFilter = 'all'
  let statusFilter = 'all'
  let stockFilter = 'all'
  let showActionMenu: string | null = null
  let selectedTab = 'medicines' // medicines | transactions | reports
  
  // Mock data for demo mode
  const mockMedicines: Medicine[] = [
    {
      id: '1',
      medicine_id: 'MED001',
      name: 'Paracetamol',
      generic_name: 'Acetaminophen',
      manufacturer: 'PharmaCorp Ltd',
      category: 'Analgesics',
      dosage_form: 'Tablet',
      strength: '500mg',
      unit_price: 0.25,
      stock_quantity: 1500,
      reorder_level: 200,
      expiry_date: '2025-12-31',
      batch_number: 'PCM001',
      supplier: 'MediSupply Co',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      medicine_id: 'MED002',
      name: 'Amoxicillin',
      generic_name: 'Amoxicillin',
      manufacturer: 'AntiBio Pharma',
      category: 'Antibiotics',
      dosage_form: 'Capsule',
      strength: '250mg',
      unit_price: 0.85,
      stock_quantity: 150,
      reorder_level: 100,
      expiry_date: '2024-08-15',
      batch_number: 'AMX002',
      supplier: 'Global Meds',
      status: 'active',
      created_at: '2024-01-10T09:30:00Z',
      updated_at: '2024-01-19T11:15:00Z'
    },
    {
      id: '3',
      medicine_id: 'MED003',
      name: 'Insulin',
      generic_name: 'Human Insulin',
      manufacturer: 'DiaCare Inc',
      category: 'Diabetes',
      dosage_form: 'Injection',
      strength: '100IU/ml',
      unit_price: 25.50,
      stock_quantity: 75,
      reorder_level: 50,
      expiry_date: '2024-06-30',
      batch_number: 'INS003',
      supplier: 'SpecialtyMeds',
      status: 'active',
      created_at: '2024-01-12T16:45:00Z',
      updated_at: '2024-01-18T10:20:00Z'
    },
    {
      id: '4',
      medicine_id: 'MED004',
      name: 'Aspirin',
      generic_name: 'Acetylsalicylic Acid',
      manufacturer: 'CardioMed',
      category: 'Cardiovascular',
      dosage_form: 'Tablet',
      strength: '75mg',
      unit_price: 0.15,
      stock_quantity: 45,
      reorder_level: 100,
      expiry_date: '2025-03-20',
      batch_number: 'ASP004',
      supplier: 'MediSupply Co',
      status: 'active',
      created_at: '2024-01-08T12:00:00Z',
      updated_at: '2024-01-17T15:45:00Z'
    }
  ]
  
  const mockTransactions: StockTransaction[] = [
    {
      id: '1',
      medicine_id: '1',
      medicine_name: 'Paracetamol 500mg',
      transaction_type: 'in',
      quantity: 500,
      unit_price: 0.25,
      total_amount: 125.00,
      reference_id: 'PO001',
      notes: 'Purchase order receipt',
      created_at: '2024-01-20T14:30:00Z',
      created_by: 'John Smith'
    },
    {
      id: '2',
      medicine_id: '2',
      medicine_name: 'Amoxicillin 250mg',
      transaction_type: 'out',
      quantity: 50,
      unit_price: 0.85,
      total_amount: 42.50,
      reference_id: 'DISP001',
      notes: 'Dispensed to patient HMS001',
      created_at: '2024-01-19T11:15:00Z',
      created_by: 'Mary Johnson'
    },
    {
      id: '3',
      medicine_id: '3',
      medicine_name: 'Insulin 100IU/ml',
      transaction_type: 'out',
      quantity: 10,
      unit_price: 25.50,
      total_amount: 255.00,
      reference_id: 'DISP002',
      notes: 'Emergency dispensing',
      created_at: '2024-01-18T10:20:00Z',
      created_by: 'Robert Brown'
    }
  ]
  
  const categories = [
    'Analgesics', 'Antibiotics', 'Cardiovascular', 'Diabetes', 'Respiratory',
    'Gastrointestinal', 'Dermatology', 'Neurology', 'Emergency', 'Vitamins'
  ]
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'discontinued', label: 'Discontinued' }
  ]
  
  const stockFilterOptions = [
    { value: 'all', label: 'All Stock' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out', label: 'Out of Stock' },
    { value: 'expiring', label: 'Expiring Soon' }
  ]
  
  $: filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.medicine_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || medicine.status === statusFilter
    
    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock = medicine.stock_quantity <= medicine.reorder_level
    } else if (stockFilter === 'out') {
      matchesStock = medicine.stock_quantity === 0
    } else if (stockFilter === 'expiring') {
      const today = new Date()
      const expiryDate = new Date(medicine.expiry_date)
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      matchesStock = daysToExpiry <= 90 && daysToExpiry > 0
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })
  
  $: filteredTransactions = transactions.filter(transaction => {
    return transaction.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  })
  
  onMount(async () => {
    await loadData()
  })
  
  async function loadData() {
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        medicines = mockMedicines
        transactions = mockTransactions
      } else {
        const [medicinesResult, transactionsResult] = await Promise.all([
          supabase.from('medicines').select('*').order('name'),
          supabase.from('stock_transactions').select('*').order('created_at', { ascending: false })
        ])
        
        if (medicinesResult.error) throw medicinesResult.error
        if (transactionsResult.error) throw transactionsResult.error
        
        medicines = medicinesResult.data || []
        transactions = transactionsResult.data || []
      }
    } catch (error) {
      console.error('Error loading pharmacy data:', error)
      medicines = []
      transactions = []
    } finally {
      loading = false
    }
  }
  
  function getStockStatus(medicine: Medicine): { status: string, color: string } {
    if (medicine.stock_quantity === 0) {
      return { status: 'Out of Stock', color: 'status-out' }
    } else if (medicine.stock_quantity <= medicine.reorder_level) {
      return { status: 'Low Stock', color: 'status-low' }
    } else {
      return { status: 'In Stock', color: 'status-good' }
    }
  }
  
  function getExpiryStatus(expiryDate: string): { status: string, color: string } {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysToExpiry < 0) {
      return { status: 'Expired', color: 'status-expired' }
    } else if (daysToExpiry <= 30) {
      return { status: 'Expires Soon', color: 'status-expiring' }
    } else if (daysToExpiry <= 90) {
      return { status: 'Expiring', color: 'status-warning' }
    } else {
      return { status: 'Good', color: 'status-good' }
    }
  }
  
  function toggleActionMenu(medicineId: string) {
    showActionMenu = showActionMenu === medicineId ? null : medicineId
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.action-menu-container')) {
      showActionMenu = null
    }
  }
  
  // Calculate pharmacy statistics
  $: pharmacyStats = {
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => m.stock_quantity <= m.reorder_level).length,
    outOfStock: medicines.filter(m => m.stock_quantity === 0).length,
    expiringSoon: medicines.filter(m => {
      const today = new Date()
      const expiry = new Date(m.expiry_date)
      const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysToExpiry <= 90 && daysToExpiry > 0
    }).length,
    totalValue: medicines.reduce((total, m) => total + (m.stock_quantity * m.unit_price), 0)
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="pharmacy-container">
  <div class="page-header">
    <div class="header-left">
      <h2>Pharmacy Management</h2>
      <p>Manage medicine inventory and stock levels</p>
    </div>
    <button class="add-button">
      <Plus size={20} />
      Add New Medicine
    </button>
  </div>
  
  <!-- Statistics Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon total">
        <Package size={24} />
      </div>
      <div class="stat-content">
        <h3>{pharmacyStats.totalMedicines}</h3>
        <p>Total Medicines</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon warning">
        <TrendingDown size={24} />
      </div>
      <div class="stat-content">
        <h3>{pharmacyStats.lowStock}</h3>
        <p>Low Stock</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon danger">
        <AlertTriangle size={24} />
      </div>
      <div class="stat-content">
        <h3>{pharmacyStats.outOfStock}</h3>
        <p>Out of Stock</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon expiring">
        <TrendingUp size={24} />
      </div>
      <div class="stat-content">
        <h3>{pharmacyStats.expiringSoon}</h3>
        <p>Expiring Soon</p>
      </div>
    </div>
    
    <div class="stat-card highlight">
      <div class="stat-content">
        <h3>${pharmacyStats.totalValue.toFixed(2)}</h3>
        <p>Total Inventory Value</p>
      </div>
    </div>
  </div>
  
  <!-- Tabs -->
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={selectedTab === 'medicines'}
      on:click={() => selectedTab = 'medicines'}
    >
      <Pill size={16} />
      Medicines
    </button>
    <button 
      class="tab-button" 
      class:active={selectedTab === 'transactions'}
      on:click={() => selectedTab = 'transactions'}
    >
      <ShoppingCart size={16} />
      Transactions
    </button>
  </div>
  
  <!-- Filters -->
  <div class="filters">
    <div class="search-box">
      <Search class="search-icon" size={20} />
      <input
        type="text"
        placeholder={selectedTab === 'medicines' ? 
          'Search medicines by name, generic name, or ID...' : 
          'Search transactions by medicine name...'
        }
        bind:value={searchTerm}
      />
    </div>
    
    {#if selectedTab === 'medicines'}
      <div class="filter-group">
        <select bind:value={categoryFilter} class="filter-select">
          <option value="all">All Categories</option>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        
        <select bind:value={statusFilter} class="filter-select">
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        
        <select bind:value={stockFilter} class="filter-select">
          {#each stockFilterOptions as option}
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
        <p>Loading pharmacy data...</p>
      </div>
    {:else if selectedTab === 'medicines'}
      {#if filteredMedicines.length === 0}
        <div class="empty-state">
          <div class="empty-icon">💊</div>
          <h3>No medicines found</h3>
          <p>
            {#if searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all'}
              Try adjusting your search or filters
            {:else}
              No medicines in inventory yet
            {/if}
          </p>
        </div>
      {:else}
        <div class="medicines-table">
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredMedicines as medicine}
                {@const stockStatus = getStockStatus(medicine)}
                {@const expiryStatus = getExpiryStatus(medicine.expiry_date)}
                <tr>
                  <td>
                    <div class="medicine-info">
                      <div class="medicine-name">
                        <span class="name">{medicine.name}</span>
                        <span class="generic">({medicine.generic_name})</span>
                      </div>
                      <div class="medicine-details">
                        <span class="strength">{medicine.strength}</span>
                        <span class="form">{medicine.dosage_form}</span>
                        <span class="id">{medicine.medicine_id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="category-badge">{medicine.category}</span>
                  </td>
                  <td>
                    <div class="stock-info">
                      <span class="quantity">{medicine.stock_quantity}</span>
                      <span class="stock-status {stockStatus.color}">{stockStatus.status}</span>
                      {#if medicine.stock_quantity <= medicine.reorder_level}
                        <span class="reorder-hint">Reorder at {medicine.reorder_level}</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <span class="price">${medicine.unit_price.toFixed(2)}</span>
                  </td>
                  <td>
                    <span class="total-value">
                      ${(medicine.stock_quantity * medicine.unit_price).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <div class="expiry-info">
                      <span class="expiry-date">{format(new Date(medicine.expiry_date), 'MMM dd, yyyy')}</span>
                      <span class="expiry-status {expiryStatus.color}">{expiryStatus.status}</span>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge status-{medicine.status}">
                      {medicine.status}
                    </span>
                  </td>
                  <td>
                    <div class="action-menu-container">
                      <button 
                        class="action-button"
                        on:click={() => toggleActionMenu(medicine.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {#if showActionMenu === medicine.id}
                        <div class="action-menu">
                          <button class="menu-item">
                            <Edit size={16} />
                            Edit Medicine
                          </button>
                          <button class="menu-item">
                            <Package size={16} />
                            Adjust Stock
                          </button>
                          <hr class="menu-divider" />
                          <button class="menu-item danger">
                            <Trash2 size={16} />
                            Remove Medicine
                          </button>
                        </div>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {:else if selectedTab === 'transactions'}
      {#if filteredTransactions.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No transactions found</h3>
          <p>No stock transactions recorded yet</p>
        </div>
      {:else}
        <div class="transactions-list">
          {#each filteredTransactions as transaction}
            <div class="transaction-card">
              <div class="transaction-header">
                <div class="transaction-info">
                  <h4>{transaction.medicine_name}</h4>
                  <span class="transaction-type {transaction.transaction_type}">
                    {transaction.transaction_type === 'in' ? 'Stock In' : 
                     transaction.transaction_type === 'out' ? 'Stock Out' : 'Adjustment'}
                  </span>
                </div>
                <div class="transaction-amount">
                  <span class="quantity {transaction.transaction_type}">
                    {transaction.transaction_type === 'out' ? '-' : '+'}{transaction.quantity}
                  </span>
                  <span class="amount">${transaction.total_amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="transaction-details">
                <div class="detail-row">
                  <span class="label">Unit Price:</span>
                  <span class="value">${transaction.unit_price.toFixed(2)}</span>
                </div>
                {#if transaction.reference_id}
                  <div class="detail-row">
                    <span class="label">Reference:</span>
                    <span class="value">{transaction.reference_id}</span>
                  </div>
                {/if}
                <div class="detail-row">
                  <span class="label">By:</span>
                  <span class="value">{transaction.created_by}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
              
              {#if transaction.notes}
                <div class="transaction-notes">
                  <p>{transaction.notes}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .pharmacy-container {
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
    background: linear-gradient(135deg, #10b981, #059669);
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
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
    background: linear-gradient(135deg, #10b981, #059669);
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
  .stat-icon.warning { background: #f59e0b; }
  .stat-icon.danger { background: #ef4444; }
  .stat-icon.expiring { background: #8b5cf6; }
  
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
    color: #3b82f6;
    border-bottom-color: #3b82f6;
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
    border-top: 3px solid #10b981;
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
  
  .medicines-table {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .medicines-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .medicines-table th {
    background: #f9fafb;
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .medicines-table td {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }
  
  .medicines-table tr:hover {
    background: #f9fafb;
  }
  
  .medicine-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .medicine-name {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .medicine-name .name {
    font-weight: 600;
    color: #111827;
  }
  
  .medicine-name .generic {
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
  }
  
  .medicine-details {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .medicine-details .strength {
    background: #e0e7ff;
    color: #3730a3;
    padding: 0.125rem 0.375rem;
    border-radius: 8px;
    font-weight: 500;
  }
  
  .medicine-details .form {
    background: #f3f4f6;
    color: #374151;
    padding: 0.125rem 0.375rem;
    border-radius: 8px;
  }
  
  .medicine-details .id {
    font-family: 'Monaco', 'Menlo', monospace;
    color: #6b7280;
  }
  
  .category-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .stock-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .stock-info .quantity {
    font-weight: 600;
    color: #111827;
  }
  
  .stock-status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 8px;
  }
  
  .status-good { background: #d1fae5; color: #065f46; }
  .status-low { background: #fed7aa; color: #9a3412; }
  .status-out { background: #fecaca; color: #991b1b; }
  
  .reorder-hint {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .price, .total-value {
    font-weight: 600;
    color: #111827;
  }
  
  .expiry-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .expiry-date {
    font-size: 0.875rem;
    color: #111827;
  }
  
  .expiry-status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 8px;
  }
  
  .status-expired { background: #fecaca; color: #991b1b; }
  .status-expiring { background: #fed7aa; color: #9a3412; }
  .status-warning { background: #fef3c7; color: #92400e; }
  
  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }
  
  .status-active { background: #d1fae5; color: #065f46; }
  .status-inactive { background: #f3f4f6; color: #374151; }
  .status-discontinued { background: #fecaca; color: #991b1b; }
  
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
  
  .transactions-list {
    display: grid;
    gap: 1rem;
  }
  
  .transaction-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .transaction-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .transaction-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .transaction-type {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    text-transform: uppercase;
  }
  
  .transaction-type.in {
    background: #d1fae5;
    color: #065f46;
  }
  
  .transaction-type.out {
    background: #fecaca;
    color: #991b1b;
  }
  
  .transaction-type.adjustment {
    background: #e0e7ff;
    color: #3730a3;
  }
  
  .transaction-amount {
    text-align: right;
  }
  
  .transaction-amount .quantity {
    display: block;
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.125rem;
  }
  
  .transaction-amount .quantity.in {
    color: #065f46;
  }
  
  .transaction-amount .quantity.out {
    color: #991b1b;
  }
  
  .transaction-amount .amount {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .transaction-details {
    padding: 0 1rem 0.5rem 1rem;
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
  }
  
  .detail-row .value {
    color: #111827;
    font-weight: 500;
  }
  
  .transaction-notes {
    padding: 0.5rem 1rem 1rem 1rem;
    background: #f9fafb;
  }
  
  .transaction-notes p {
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
    
    .medicines-table {
      overflow-x: auto;
    }
    
    .medicines-table table {
      min-width: 800px;
    }
  }
</style>