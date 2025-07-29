<script lang="ts">
  import { signIn } from '../../stores/auth'
  import { Eye, EyeOff, Lock, Mail } from 'lucide-svelte'
  
  let email = ''
  let password = ''
  let showPassword = false
  let loading = false
  let error = ''
  
  async function handleSubmit() {
    if (!email || !password) {
      error = 'Please fill in all fields'
      return
    }
    
    loading = true
    error = ''
    
    try {
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        error = signInError.message
      }
    } catch (err) {
      error = 'An unexpected error occurred'
    } finally {
      loading = false
    }
  }
  
  function togglePasswordVisibility() {
    showPassword = !showPassword
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <div class="logo">
        <div class="logo-icon">🏥</div>
        <h1>Hospital Management System</h1>
      </div>
      <p class="subtitle">Sign in to your account</p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="login-form">
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
      
      <div class="form-group">
        <label for="email">Email Address</label>
        <div class="input-wrapper">
          <span class="input-icon">
            <Mail size={20} />
          </span>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-wrapper">
          <span class="input-icon">
            <Lock size={20} />
          </span>
          {#if showPassword}
            <input
              id="password"
              type="text"
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          {:else}
            <input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          {/if}
          <button
            type="button"
            class="password-toggle"
            on:click={togglePasswordVisibility}
            disabled={loading}
          >
            {#if showPassword}
              <EyeOff size={20} />
            {:else}
              <Eye size={20} />
            {/if}
          </button>
        </div>
      </div>
      
      <button type="submit" class="login-button" disabled={loading}>
        {#if loading}
          <div class="spinner"></div>
          Signing in...
        {:else}
          Sign In
        {/if}
      </button>
    </form>
    
    <div class="login-footer">
      <p>Demo Credentials:</p>
      <div class="demo-credentials">
        <div><strong>Admin:</strong> admin@hospital.com / admin123</div>
        <div><strong>Doctor:</strong> doctor@hospital.com / doctor123</div>
        <div><strong>Nurse:</strong> nurse@hospital.com / nurse123</div>
      </div>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }
  
  .login-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .logo-icon {
    font-size: 3rem;
    line-height: 1;
  }
  
  .logo h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  
  .subtitle {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    text-align: center;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .input-icon {
    position: absolute;
    left: 0.75rem;
    color: #9ca3af;
    z-index: 1;
  }
  
  .input-wrapper input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: white;
  }
  
  .input-wrapper input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .input-wrapper input:disabled {
    background: #f9fafb;
    color: #6b7280;
  }
  
  .password-toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }
  
  .password-toggle:hover {
    color: #6b7280;
  }
  
  .password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .login-button {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .login-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  }
  
  .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .login-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }
  
  .login-footer p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0 0 0.75rem 0;
    font-weight: 600;
  }
  
  .demo-credentials {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .demo-credentials div {
    background: #f9fafb;
    padding: 0.5rem;
    border-radius: 4px;
  }
</style>