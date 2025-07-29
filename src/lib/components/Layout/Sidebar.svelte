<script lang="ts">
  import { auth } from '../../stores/auth'
  import { navigationItems, currentPath, sidebarOpen } from '../../stores/navigation'
  import { ChevronDown, ChevronRight } from 'lucide-svelte'
  import { onMount } from 'svelte'
  
  let expandedItems: Set<string> = new Set()
  
  $: userRole = $auth.profile?.role
  
  // Filter navigation items based on user role
  $: filteredNavItems = navigationItems.filter(item => 
    userRole && item.roles.includes(userRole)
  )
  
  function toggleExpanded(itemId: string) {
    if (expandedItems.has(itemId)) {
      expandedItems.delete(itemId)
    } else {
      expandedItems.add(itemId)
    }
    expandedItems = expandedItems
  }
  
  function isActive(path: string): boolean {
    return $currentPath === path || $currentPath.startsWith(path + '/')
  }
  
  function hasAccessToChild(children: any[], role: string): boolean {
    return children.some(child => child.roles.includes(role))
  }
</script>

<aside class="sidebar" class:collapsed={!$sidebarOpen}>
  <div class="sidebar-header">
    <div class="logo">
      <div class="logo-icon">🏥</div>
      {#if $sidebarOpen}
        <span class="logo-text">HMS</span>
      {/if}
    </div>
  </div>
  
  <nav class="sidebar-nav">
    {#each filteredNavItems as item}
      <div class="nav-item">
        {#if item.children && userRole && hasAccessToChild(item.children, userRole)}
          <button 
            class="nav-link parent"
            class:active={isActive(item.path)}
            on:click={() => {
              currentPath.set(item.path)
              toggleExpanded(item.id)
            }}
          >
            <div class="nav-link-content">
              <span class="nav-icon">
                {#if item.icon === 'LayoutDashboard'}📊
                {:else if item.icon === 'Users'}👥
                {:else if item.icon === 'Building'}🏢
                {:else if item.icon === 'Bed'}🛏️
                {:else if item.icon === 'Heart'}❤️
                {:else if item.icon === 'Receipt'}🧾
                {:else if item.icon === 'Pill'}💊
                {:else if item.icon === 'TestTube'}🧪
                {:else if item.icon === 'Users2'}👨‍👩‍👧‍👦
                {:else if item.icon === 'BarChart3'}📈
                {:else}📋{/if}
              </span>
              {#if $sidebarOpen}
                <span class="nav-text">{item.label}</span>
              {/if}
            </div>
            {#if $sidebarOpen}
              <span class="expand-icon">
                {#if expandedItems.has(item.id)}
                  <ChevronDown size={16} />
                {:else}
                  <ChevronRight size={16} />
                {/if}
              </span>
            {/if}
          </button>
          
          {#if expandedItems.has(item.id) && $sidebarOpen}
            <div class="nav-children">
              {#each item.children as child}
                {#if userRole && child.roles.includes(userRole)}
                  <button 
                    class="nav-link child"
                    class:active={isActive(child.path)}
                    on:click={() => currentPath.set(child.path)}
                  >
                    <span class="nav-icon">
                      {#if child.icon === 'Search'}🔍
                      {:else if child.icon === 'Calendar'}📅
                      {:else if child.icon === 'UserPlus'}👤➕
                      {:else if child.icon === 'UserCheck'}✅
                      {:else if child.icon === 'UserMinus'}👤➖
                      {:else if child.icon === 'CreditCard'}💳
                      {:else if child.icon === 'FileText'}📄
                      {:else if child.icon === 'MapPin'}📍
                      {:else if child.icon === 'BarChart3'}📊
                      {:else if child.icon === 'Home'}🏠
                      {:else if child.icon === 'Grid3x3'}⚏
                      {:else if child.icon === 'Settings'}⚙️
                      {:else if child.icon === 'Stethoscope'}🩺
                      {:else if child.icon === 'Activity'}📈
                      {:else if child.icon === 'Banknote'}💵
                      {:else if child.icon === 'TrendingUp'}📈
                      {:else if child.icon === 'Package'}📦
                      {:else if child.icon === 'FlaskConical'}🧪
                      {:else if child.icon === 'UserCog'}👤⚙️
                      {:else if child.icon === 'Calculator'}🧮
                      {:else if child.icon === 'Monitor'}🖥️
                      {:else if child.icon === 'FileBarChart'}📊
                      {:else}📋{/if}
                    </span>
                    <span class="nav-text">{child.label}</span>
                  </button>
                {/if}
              {/each}
            </div>
          {/if}
        {:else}
          <button 
            class="nav-link"
            class:active={isActive(item.path)}
            on:click={() => currentPath.set(item.path)}
          >
            <div class="nav-link-content">
              <span class="nav-icon">
                {#if item.icon === 'LayoutDashboard'}📊
                {:else if item.icon === 'Users'}👥
                {:else if item.icon === 'Building'}🏢
                {:else if item.icon === 'Bed'}🛏️
                {:else if item.icon === 'Heart'}❤️
                {:else if item.icon === 'Receipt'}🧾
                {:else if item.icon === 'Pill'}💊
                {:else if item.icon === 'TestTube'}🧪
                {:else if item.icon === 'Users2'}👨‍👩‍👧‍👦
                {:else if item.icon === 'BarChart3'}📈
                {:else}📋{/if}
              </span>
              {#if $sidebarOpen}
                <span class="nav-text">{item.label}</span>
              {/if}
            </div>
          </button>
        {/if}
      </div>
    {/each}
  </nav>
</aside>

<style>
  .sidebar {
    width: 280px;
    height: 100vh;
    background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
    color: white;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar.collapsed {
    width: 70px;
  }
  
  .sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo-icon {
    font-size: 2rem;
    line-height: 1;
  }
  
  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
  }
  
  .nav-item {
    margin-bottom: 0.25rem;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    background: none;
    width: 100%;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .nav-link.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-right: 3px solid #60a5fa;
  }
  
  .nav-link.child {
    padding-left: 2.5rem;
    font-size: 0.8125rem;
  }
  
  .nav-link-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }
  
  .nav-icon {
    font-size: 1.25rem;
    line-height: 1;
    min-width: 1.25rem;
  }
  
  .nav-text {
    font-weight: 500;
  }
  
  .expand-icon {
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }
  
  .nav-link:hover .expand-icon {
    opacity: 1;
  }
  
  .nav-children {
    background: rgba(0, 0, 0, 0.1);
  }
  
  /* Scrollbar styling */
  .sidebar-nav::-webkit-scrollbar {
    width: 4px;
  }
  
  .sidebar-nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
  
  .sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>