<script lang="ts">
  import { auth } from './lib/stores/auth'
  import LoginForm from './lib/components/Auth/LoginForm.svelte'
  import Sidebar from './lib/components/Layout/Sidebar.svelte'
  import Header from './lib/components/Layout/Header.svelte'
  import DashboardStats from './lib/components/Dashboard/DashboardStats.svelte'
  import PatientList from './lib/components/Patients/PatientList.svelte'
  import { currentPath } from './lib/stores/navigation'
  
  $: isAuthenticated = $auth.user && $auth.profile
  $: currentRoute = $currentPath
</script>

{#if $auth.loading}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="logo">🏥</div>
      <h1>Hospital Management System</h1>
      <div class="spinner"></div>
    </div>
  </div>
{:else if !isAuthenticated}
  <LoginForm />
{:else}
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <main class="content">
        {#if currentRoute === '/dashboard' || currentRoute === '/'}
          <div class="dashboard">
            <div class="dashboard-header">
              <h1>Dashboard</h1>
              <p>Welcome back, {$auth.profile?.full_name}!</p>
            </div>
            <DashboardStats />
            <div class="dashboard-grid">
              <div class="dashboard-card">
                <h3>Recent Patients</h3>
                <PatientList />
              </div>
            </div>
          </div>
        {:else if currentRoute.startsWith('/patient-journey')}
          <div class="page-content">
            <PatientList />
          </div>
        {:else}
          <div class="page-content">
            <div class="coming-soon">
              <div class="coming-soon-icon">🚧</div>
              <h2>Coming Soon</h2>
              <p>This module is under development and will be available soon.</p>
            </div>
          </div>
        {/if}
      </main>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8fafc;
    color: #1f2937;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .loading-content {
    text-align: center;
    color: white;
  }
  
  .loading-content .logo {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .loading-content h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .app-layout {
    display: flex;
    min-height: 100vh;
  }
  
  .main-content {
    flex: 1;
    margin-left: 280px;
    transition: margin-left 0.3s ease;
  }
  
  :global(.sidebar.collapsed) ~ .main-content {
    margin-left: 70px;
  }
  
  .content {
    margin-top: 64px;
    min-height: calc(100vh - 64px);
  }
  
  .dashboard {
    padding: 2rem;
  }
  
  .dashboard-header {
    margin-bottom: 2rem;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .dashboard-header p {
    color: #6b7280;
    margin: 0;
    font-size: 1.125rem;
  }
  
  .dashboard-grid {
    display: grid;
    gap: 1.5rem;
  }
  
  .dashboard-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .dashboard-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
  
  .page-content {
    min-height: calc(100vh - 64px);
  }
  
  .coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 64px);
    text-align: center;
    padding: 2rem;
  }
  
  .coming-soon-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .coming-soon h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }
  
  .coming-soon p {
    color: #6b7280;
    margin: 0;
  }
</style>
