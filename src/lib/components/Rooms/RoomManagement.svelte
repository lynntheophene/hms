<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { Bed, Plus, Search, Filter, MoreVertical, Edit, Trash2, Users, CheckCircle, AlertCircle, Clock } from 'lucide-svelte'
  
  interface Room {
    id: string
    room_number: string
    room_category: string
    floor: number
    capacity: number
    current_occupancy: number
    status: 'available' | 'occupied' | 'maintenance' | 'reserved'
    amenities: string[]
    rate_per_day: number
    patient_name?: string
    admission_date?: string
    expected_discharge?: string
  }
  
  let rooms: Room[] = []
  let loading = true
  let searchTerm = ''
  let statusFilter = 'all'
  let floorFilter = 'all'
  let categoryFilter = 'all'
  let showActionMenu: string | null = null
  
  // Mock data for demo mode
  const mockRooms: Room[] = [
    {
      id: '1',
      room_number: '101',
      room_category: 'General Ward',
      floor: 1,
      capacity: 2,
      current_occupancy: 1,
      status: 'occupied',
      amenities: ['AC', 'TV', 'Private Bathroom'],
      rate_per_day: 150,
      patient_name: 'Sarah Johnson',
      admission_date: '2024-01-18',
      expected_discharge: '2024-01-25'
    },
    {
      id: '2',
      room_number: '102',
      room_category: 'General Ward',
      floor: 1,
      capacity: 2,
      current_occupancy: 0,
      status: 'available',
      amenities: ['AC', 'TV'],
      rate_per_day: 150
    },
    {
      id: '3',
      room_number: '201',
      room_category: 'Private',
      floor: 2,
      capacity: 1,
      current_occupancy: 1,
      status: 'occupied',
      amenities: ['AC', 'TV', 'Private Bathroom', 'Refrigerator', 'Sofa'],
      rate_per_day: 300,
      patient_name: 'Michael Chen',
      admission_date: '2024-01-20',
      expected_discharge: '2024-01-22'
    },
    {
      id: '4',
      room_number: '301',
      room_category: 'ICU',
      floor: 3,
      capacity: 1,
      current_occupancy: 0,
      status: 'available',
      amenities: ['Life Support', 'Monitoring Equipment', 'Ventilator'],
      rate_per_day: 800
    },
    {
      id: '5',
      room_number: '302',
      room_category: 'ICU',
      floor: 3,
      capacity: 1,
      current_occupancy: 1,
      status: 'occupied',
      amenities: ['Life Support', 'Monitoring Equipment', 'Ventilator'],
      rate_per_day: 800,
      patient_name: 'Emily Rodriguez',
      admission_date: '2024-01-19',
      expected_discharge: '2024-01-24'
    },
    {
      id: '6',
      room_number: '103',
      room_category: 'General Ward',
      floor: 1,
      capacity: 4,
      current_occupancy: 0,
      status: 'maintenance',
      amenities: ['AC', 'TV'],
      rate_per_day: 120
    }
  ]
  
  const roomCategories = ['General Ward', 'Private', 'ICU', 'Emergency', 'Surgery']
  const floors = [1, 2, 3, 4, 5]
  
  const statusOptions = [
    { value: 'all', label: 'All Rooms' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'reserved', label: 'Reserved' }
  ]
  
  $: filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.patient_name && room.patient_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter
    const matchesCategory = categoryFilter === 'all' || room.room_category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesFloor && matchesCategory
  })
  
  // Group rooms by floor for better visualization
  $: roomsByFloor = filteredRooms.reduce((acc, room) => {
    const floor = room.floor
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(room)
    return acc
  }, {} as Record<number, Room[]>)
  
  onMount(async () => {
    await loadRooms()
  })
  
  async function loadRooms() {
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        rooms = mockRooms
      } else {
        const { data, error } = await supabase
          .from('rooms')
          .select(`
            *,
            room_category:room_categories(name),
            admissions!inner(
              patient:patients(full_name),
              admission_date,
              expected_discharge_date
            )
          `)
          .order('floor', { ascending: true })
          .order('room_number', { ascending: true })
        
        if (error) throw error
        rooms = data || []
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
      rooms = []
    } finally {
      loading = false
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'status-available'
      case 'occupied': return 'status-occupied'
      case 'maintenance': return 'status-maintenance'
      case 'reserved': return 'status-reserved'
      default: return 'status-default'
    }
  }
  
  function getStatusIcon(status: string) {
    switch (status) {
      case 'available': return CheckCircle
      case 'occupied': return Users
      case 'maintenance': return AlertCircle
      case 'reserved': return Clock
      default: return Bed
    }
  }
  
  function getOccupancyPercentage(room: Room): number {
    return (room.current_occupancy / room.capacity) * 100
  }
  
  function toggleActionMenu(roomId: string) {
    showActionMenu = showActionMenu === roomId ? null : roomId
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.action-menu-container')) {
      showActionMenu = null
    }
  }
  
  // Calculate room statistics
  $: roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    occupancyRate: rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100) : 0
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="room-management-container">
  <div class="page-header">
    <div class="header-left">
      <h2>Room Management</h2>
      <p>Monitor room availability and occupancy</p>
    </div>
    <button class="add-button">
      <Plus size={20} />
      Add New Room
    </button>
  </div>
  
  <!-- Room Statistics -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon total">
        <Bed size={24} />
      </div>
      <div class="stat-content">
        <h3>{roomStats.total}</h3>
        <p>Total Rooms</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon available">
        <CheckCircle size={24} />
      </div>
      <div class="stat-content">
        <h3>{roomStats.available}</h3>
        <p>Available</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon occupied">
        <Users size={24} />
      </div>
      <div class="stat-content">
        <h3>{roomStats.occupied}</h3>
        <p>Occupied</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon maintenance">
        <AlertCircle size={24} />
      </div>
      <div class="stat-content">
        <h3>{roomStats.maintenance}</h3>
        <p>Maintenance</p>
      </div>
    </div>
    
    <div class="stat-card highlight">
      <div class="stat-content">
        <h3>{roomStats.occupancyRate}%</h3>
        <p>Occupancy Rate</p>
      </div>
      <div class="occupancy-bar">
        <div class="occupancy-fill" style="width: {roomStats.occupancyRate}%"></div>
      </div>
    </div>
  </div>
  
  <!-- Filters -->
  <div class="filters">
    <div class="search-box">
      <Search class="search-icon" size={20} />
      <input
        type="text"
        placeholder="Search rooms by number, category, or patient..."
        bind:value={searchTerm}
      />
    </div>
    
    <div class="filter-group">
      <select bind:value={statusFilter} class="filter-select">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      
      <select bind:value={categoryFilter} class="filter-select">
        <option value="all">All Categories</option>
        {#each roomCategories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
      
      <select bind:value={floorFilter} class="filter-select">
        <option value="all">All Floors</option>
        {#each floors as floor}
          <option value={floor.toString()}>Floor {floor}</option>
        {/each}
      </select>
      
      <button class="filter-button">
        <Filter size={20} />
        More Filters
      </button>
    </div>
  </div>
  
  <!-- Room Grid -->
  <div class="content-area">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading rooms...</p>
      </div>
    {:else if filteredRooms.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🏨</div>
        <h3>No rooms found</h3>
        <p>
          {#if searchTerm || statusFilter !== 'all' || floorFilter !== 'all' || categoryFilter !== 'all'}
            Try adjusting your search or filters
          {:else}
            No rooms configured yet
          {/if}
        </p>
      </div>
    {:else}
      <div class="rooms-by-floor">
        {#each Object.entries(roomsByFloor).sort(([a], [b]) => parseInt(a) - parseInt(b)) as [floor, floorRooms]}
          <div class="floor-section">
            <h3 class="floor-header">
              <span>Floor {floor}</span>
              <span class="floor-stats">
                {floorRooms.filter(r => r.status === 'available').length} available, 
                {floorRooms.filter(r => r.status === 'occupied').length} occupied
              </span>
            </h3>
            
            <div class="rooms-grid">
              {#each floorRooms as room}
                <div class="room-card {room.status}">
                  <div class="room-header">
                    <div class="room-info">
                      <h4>Room {room.room_number}</h4>
                      <span class="room-category">{room.room_category}</span>
                    </div>
                    
                    <div class="room-status">
                      <div class="status-indicator">
                        <svelte:component this={getStatusIcon(room.status)} size={16} />
                        <span class="status-text {getStatusColor(room.status)}">
                          {room.status}
                        </span>
                      </div>
                      
                      <div class="action-menu-container">
                        <button 
                          class="action-button"
                          on:click={() => toggleActionMenu(room.id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {#if showActionMenu === room.id}
                          <div class="action-menu">
                            <button class="menu-item">
                              <Edit size={16} />
                              Edit Room
                            </button>
                            <button class="menu-item">
                              <Users size={16} />
                              Assign Patient
                            </button>
                            <hr class="menu-divider" />
                            <button class="menu-item danger">
                              <Trash2 size={16} />
                              Delete Room
                            </button>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                  
                  <div class="room-details">
                    <div class="capacity-info">
                      <span class="capacity-label">Capacity:</span>
                      <div class="capacity-display">
                        <span class="occupancy">{room.current_occupancy}/{room.capacity}</span>
                        <div class="capacity-bar">
                          <div 
                            class="capacity-fill" 
                            style="width: {getOccupancyPercentage(room)}%"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="rate-info">
                      <span class="rate-label">Rate:</span>
                      <span class="rate-amount">${room.rate_per_day}/day</span>
                    </div>
                  </div>
                  
                  {#if room.status === 'occupied' && room.patient_name}
                    <div class="patient-info">
                      <h5>Current Patient</h5>
                      <p class="patient-name">{room.patient_name}</p>
                      <div class="admission-info">
                        <span class="admission-date">
                          Admitted: {new Date(room.admission_date || '').toLocaleDateString()}
                        </span>
                        {#if room.expected_discharge}
                          <span class="discharge-date">
                            Expected discharge: {new Date(room.expected_discharge).toLocaleDateString()}
                          </span>
                        {/if}
                      </div>
                    </div>
                  {/if}
                  
                  {#if room.amenities.length > 0}
                    <div class="amenities">
                      <h5>Amenities</h5>
                      <div class="amenities-list">
                        {#each room.amenities as amenity}
                          <span class="amenity-tag">{amenity}</span>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .room-management-container {
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
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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
  .stat-icon.available { background: #10b981; }
  .stat-icon.occupied { background: #f59e0b; }
  .stat-icon.maintenance { background: #ef4444; }
  
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
  
  .occupancy-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin-top: 0.5rem;
    overflow: hidden;
  }
  
  .occupancy-fill {
    height: 100%;
    background: white;
    transition: width 0.3s ease;
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
  
  .floor-section {
    margin-bottom: 2rem;
  }
  
  .floor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
  }
  
  .floor-stats {
    font-size: 0.875rem;
    font-weight: 400;
    color: #6b7280;
  }
  
  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }
  
  .room-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .room-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .room-card.available {
    border-left: 4px solid #10b981;
  }
  
  .room-card.occupied {
    border-left: 4px solid #f59e0b;
  }
  
  .room-card.maintenance {
    border-left: 4px solid #ef4444;
  }
  
  .room-card.reserved {
    border-left: 4px solid #8b5cf6;
  }
  
  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .room-info h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .room-category {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .room-status {
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
  
  .status-available { color: #10b981; }
  .status-occupied { color: #f59e0b; }
  .status-maintenance { color: #ef4444; }
  .status-reserved { color: #8b5cf6; }
  
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
  
  .room-details {
    padding: 0 1rem 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .capacity-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .capacity-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .capacity-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .occupancy {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .capacity-bar {
    width: 60px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .capacity-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }
  
  .rate-info {
    text-align: right;
  }
  
  .rate-label {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .rate-amount {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .patient-info {
    padding: 0.5rem 1rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }
  
  .patient-info h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .patient-name {
    font-size: 0.875rem;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .admission-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .admission-date,
  .discharge-date {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .amenities {
    padding: 0.5rem 1rem 1rem 1rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .amenities h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .amenities-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .amenity-tag {
    font-size: 0.75rem;
    background: #e0e7ff;
    color: #3730a3;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .rooms-grid {
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
    
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .floor-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }
</style>