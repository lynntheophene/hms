<script lang="ts">
  import { auth, signOut } from '../../stores/auth'
  import { sidebarOpen } from '../../stores/navigation'
  import { Menu, Bell, User, LogOut, Settings } from 'lucide-svelte'
  
  let showUserMenu = false
  
  function toggleSidebar() {
    sidebarOpen.update(open => !open)
  }
  
  function toggleUserMenu() {
    showUserMenu = !showUserMenu
  }
  
  async function handleSignOut() {
    await signOut()
    showUserMenu = false
  }
  
  // Close user menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element
    if (!target.closest('.user-menu-container')) {
      showUserMenu = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="header">
  <div class="header-left">
    <button class="menu-button" on:click={toggleSidebar}>
      <Menu size={20} />
    </button>
    <h1 class="page-title">Hospital Management System</h1>
  </div>
  
  <div class="header-right">
    <button class="notification-button">
      <Bell size={20} />
      <span class="notification-badge">3</span>
    </button>
    
    <div class="user-menu-container">
      <button class="user-button" on:click={toggleUserMenu}>
        <div class="user-avatar">
          <User size={16} />
        </div>
        <div class="user-info">
          <span class="user-name">{$auth.profile?.full_name || 'User'}</span>
          <span class="user-role">{$auth.profile?.role || 'Role'}</span>
        </div>
      </button>
      
      {#if showUserMenu}
        <div class="user-menu">
          <a href="/profile" class="menu-item">
            <User size={16} />
            <span>Profile</span>
          </a>
          <a href="/settings" class="menu-item">
            <Settings size={16} />
            <span>Settings</span>
          </a>
          <hr class="menu-divider" />
          <button class="menu-item" on:click={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .header {
    height: 64px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    position: fixed;
    top: 0;
    right: 0;
    left: 280px;
    z-index: 999;
    transition: left 0.3s ease;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .menu-button:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .page-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .notification-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .notification-button:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .notification-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ef4444;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .user-menu-container {
    position: relative;
  }
  
  .user-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .user-button:hover {
    background: #f3f4f6;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    background: #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    line-height: 1.2;
  }
  
  .user-role {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: capitalize;
    line-height: 1.2;
  }
  
  .user-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    min-width: 200px;
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
    text-decoration: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  
  .menu-item:hover {
    background: #f3f4f6;
  }
  
  .menu-item:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  .menu-item:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  .menu-divider {
    margin: 0;
    border: none;
    border-top: 1px solid #e5e7eb;
  }
</style>