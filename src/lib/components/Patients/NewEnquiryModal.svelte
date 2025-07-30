<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { supabase, isDemoMode } from '../../supabase'
  import { X, Phone, Mail, Calendar, Clock, User, MessageSquare } from 'lucide-svelte'
  
  const dispatch = createEventDispatcher()
  
  export let show = false
  
  let loading = false
  let formData = {
    patient_name: '',
    phone: '',
    email: '',
    enquiry_type: 'appointment',
    department: 'General Medicine',
    preferred_date: '',
    preferred_time: '',
    message: ''
  }
  
  const enquiryTypes = [
    { value: 'appointment', label: 'Appointment Request' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'complaint', label: 'Complaint' }
  ]
  
  const departments = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Gynecology', 'Emergency', 'Surgery', 'Radiology'
  ]
  
  function handleClose() {
    if (!loading) {
      show = false
      dispatch('close')
    }
  }
  
  function resetForm() {
    formData = {
      patient_name: '',
      phone: '',
      email: '',
      enquiry_type: 'appointment',
      department: 'General Medicine',
      preferred_date: '',
      preferred_time: '',
      message: ''
    }
  }
  
  async function handleSubmit() {
    if (loading) return
    
    // Basic validation
    if (!formData.patient_name.trim()) {
      alert('Patient name is required')
      return
    }
    
    if (!formData.phone.trim()) {
      alert('Phone number is required')
      return
    }
    
    if (!formData.message.trim()) {
      alert('Message is required')
      return
    }
    
    loading = true
    
    try {
      const enquiryData = {
        enquiry_id: generateEnquiryId(),
        patient_name: formData.patient_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        enquiry_type: formData.enquiry_type,
        department: formData.department,
        preferred_date: formData.preferred_date || null,
        preferred_time: formData.preferred_time || null,
        message: formData.message.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      if (isDemoMode) {
        // In demo mode, just dispatch the event to add to local state
        dispatch('enquiry-added', enquiryData)
        alert('Enquiry added successfully! (Demo mode)')
      } else {
        // In production mode, save to Supabase
        const { error } = await supabase
          .from('enquiries')
          .insert([enquiryData])
        
        if (error) throw error
        
        dispatch('enquiry-added', enquiryData)
        alert('Enquiry added successfully!')
      }
      
      resetForm()
      handleClose()
    } catch (error) {
      console.error('Error creating enquiry:', error)
      alert('Failed to create enquiry. Please try again.')
    } finally {
      loading = false
    }
  }
  
  function generateEnquiryId(): string {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ENQ${year}${month}${day}${random}`
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose()
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="modal-overlay" on:click={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-content" on:click|stopPropagation role="document">
      <div class="modal-header">
        <div class="header-left">
          <h3 id="modal-title">New Patient Enquiry</h3>
          <p>Create a new patient inquiry or appointment request</p>
        </div>
        <button class="close-button" on:click={handleClose} aria-label="Close modal">
          <X size={20} />
        </button>
      </div>
      
      <form class="modal-body" on:submit|preventDefault={handleSubmit}>
        <div class="form-grid">
          <div class="form-group">
            <label for="patient-name">
              <User size={16} />
              Patient Name <span class="required">*</span>
            </label>
            <input
              id="patient-name"
              type="text"
              bind:value={formData.patient_name}
              placeholder="Enter patient's full name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="phone">
              <Phone size={16} />
              Phone Number <span class="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              bind:value={formData.phone}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">
              <Mail size={16} />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              bind:value={formData.email}
              placeholder="Enter email address (optional)"
            />
          </div>
          
          <div class="form-group">
            <label for="enquiry-type">
              <MessageSquare size={16} />
              Enquiry Type
            </label>
            <select id="enquiry-type" bind:value={formData.enquiry_type}>
              {#each enquiryTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="department">
              Department
            </label>
            <select id="department" bind:value={formData.department}>
              {#each departments as dept}
                <option value={dept}>{dept}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="preferred-date">
              <Calendar size={16} />
              Preferred Date
            </label>
            <input
              id="preferred-date"
              type="date"
              bind:value={formData.preferred_date}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div class="form-group">
            <label for="preferred-time">
              <Clock size={16} />
              Preferred Time
            </label>
            <input
              id="preferred-time"
              type="time"
              bind:value={formData.preferred_time}
            />
          </div>
        </div>
        
        <div class="form-group full-width">
          <label for="message">
            <MessageSquare size={16} />
            Message/Reason <span class="required">*</span>
          </label>
          <textarea
            id="message"
            bind:value={formData.message}
            placeholder="Describe the reason for inquiry or appointment"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="cancel-button" on:click={handleClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" class="submit-button" disabled={loading}>
            {#if loading}
              <div class="spinner"></div>
              Creating...
            {:else}
              Create Enquiry
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem 1.5rem 0 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }
  
  .header-left h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }
  
  .header-left p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
  }
  
  .close-button {
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
  
  .close-button:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .modal-body {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .required {
    color: #dc2626;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .modal-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .cancel-button {
    padding: 0.75rem 1.5rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cancel-button:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .submit-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .submit-button:disabled {
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
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 640px) {
    .modal-content {
      margin: 0;
      max-height: 100vh;
      border-radius: 0;
    }
    
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-footer {
      flex-direction: column-reverse;
    }
    
    .cancel-button,
    .submit-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>