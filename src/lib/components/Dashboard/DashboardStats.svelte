<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '../../supabase'
  import { TrendingUp, TrendingDown, Users, Bed, Calendar, Receipt } from 'lucide-svelte'
  
  interface DashboardStats {
    totalPatients: number
    activeAdmissions: number
    todayAppointments: number
    pendingBills: number
    availableRooms: number
    occupancyRate: number
  }
  
  let stats: DashboardStats = {
    totalPatients: 0,
    activeAdmissions: 0,
    todayAppointments: 0,
    pendingBills: 0,
    availableRooms: 0,
    occupancyRate: 0
  }
  
  let loading = true
  
  onMount(async () => {
    await loadStats()
  })
  
  async function loadStats() {
    try {
      // Get total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
      
      // Get active admissions
      const { count: activeAdmissions } = await supabase
        .from('admissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'confirmed'])
      
      // Get pending bills
      const { count: pendingBills } = await supabase
        .from('billing')
        .select('*', { count: 'exact', head: true })
        .in('payment_status', ['pending', 'partial', 'overdue'])
      
      // Get room statistics
      const { data: rooms } = await supabase
        .from('rooms')
        .select('status')
      
      const availableRooms = rooms?.filter(room => room.status === 'available').length || 0
      const totalRooms = rooms?.length || 1
      const occupancyRate = ((totalRooms - availableRooms) / totalRooms) * 100
      
      stats = {
        totalPatients: totalPatients || 0,
        activeAdmissions: activeAdmissions || 0,
        todayAppointments: todayAppointments || 0,
        pendingBills: pendingBills || 0,
        availableRooms,
        occupancyRate: Math.round(occupancyRate)
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      loading = false
    }
  }
</script>

<div class="stats-grid">
  <div class="stat-card patients">
    <div class="stat-header">
      <div class="stat-icon">
        <Users size={24} />
      </div>
      <div class="stat-trend positive">
        <TrendingUp size={16} />
        <span>+12%</span>
      </div>
    </div>
    <div class="stat-content">
      <h3 class="stat-value">
        {#if loading}
          <div class="skeleton-text"></div>
        {:else}
          {stats.totalPatients.toLocaleString()}
        {/if}
      </h3>
      <p class="stat-label">Total Patients</p>
    </div>
  </div>
  
  <div class="stat-card admissions">
    <div class="stat-header">
      <div class="stat-icon">
        <Bed size={24} />
      </div>
      <div class="stat-trend positive">
        <TrendingUp size={16} />
        <span>+8%</span>
      </div>
    </div>
    <div class="stat-content">
      <h3 class="stat-value">
        {#if loading}
          <div class="skeleton-text"></div>
        {:else}
          {stats.activeAdmissions}
        {/if}
      </h3>
      <p class="stat-label">Active Admissions</p>
    </div>
  </div>
  
  <div class="stat-card appointments">
    <div class="stat-header">
      <div class="stat-icon">
        <Calendar size={24} />
      </div>
      <div class="stat-trend neutral">
        <span>Today</span>
      </div>
    </div>
    <div class="stat-content">
      <h3 class="stat-value">
        {#if loading}
          <div class="skeleton-text"></div>
        {:else}
          {stats.todayAppointments}
        {/if}
      </h3>
      <p class="stat-label">Appointments</p>
    </div>
  </div>
  
  <div class="stat-card billing">
    <div class="stat-header">
      <div class="stat-icon">
        <Receipt size={24} />
      </div>
      <div class="stat-trend negative">
        <TrendingDown size={16} />
        <span>-5%</span>
      </div>
    </div>
    <div class="stat-content">
      <h3 class="stat-value">
        {#if loading}
          <div class="skeleton-text"></div>
        {:else}
          {stats.pendingBills}
        {/if}
      </h3>
      <p class="stat-label">Pending Bills</p>
    </div>
  </div>
  
  <div class="stat-card rooms">
    <div class="stat-header">
      <div class="stat-icon">
        <Bed size={24} />
      </div>
      <div class="stat-trend neutral">
        <span>{stats.occupancyRate}%</span>
      </div>
    </div>
    <div class="stat-content">
      <h3 class="stat-value">
        {#if loading}
          <div class="skeleton-text"></div>
        {:else}
          {stats.availableRooms}
        {/if}
      </h3>
      <p class="stat-label">Available Rooms</p>
    </div>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .stat-card.patients {
    border-left: 4px solid #3b82f6;
  }
  
  .stat-card.admissions {
    border-left: 4px solid #10b981;
  }
  
  .stat-card.appointments {
    border-left: 4px solid #f59e0b;
  }
  
  .stat-card.billing {
    border-left: 4px solid #ef4444;
  }
  
  .stat-card.rooms {
    border-left: 4px solid #8b5cf6;
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
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
  
  .patients .stat-icon {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  }
  
  .admissions .stat-icon {
    background: linear-gradient(135deg, #10b981, #059669);
  }
  
  .appointments .stat-icon {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }
  
  .billing .stat-icon {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
  
  .rooms .stat-icon {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }
  
  .stat-trend.positive {
    background: #dcfce7;
    color: #166534;
  }
  
  .stat-trend.negative {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .stat-trend.neutral {
    background: #f3f4f6;
    color: #374151;
  }
  
  .stat-content {
    text-align: left;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    font-weight: 500;
  }
  
  .skeleton-text {
    height: 2rem;
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    width: 80px;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>