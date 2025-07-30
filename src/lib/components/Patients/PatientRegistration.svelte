<script lang="ts">
  import { supabase, isDemoMode } from '../../supabase'
  import { createEventDispatcher } from 'svelte'
  import { Save, X, User, Phone, Mail, Calendar, MapPin, FileText } from 'lucide-svelte'
  
  const dispatch = createEventDispatcher()
  
  interface PatientData {
    patient_id: string
    full_name: string
    date_of_birth: string
    gender: string
    phone: string
    email: string
    address: string
    emergency_contact_name: string
    emergency_contact_phone: string
    blood_group: string
    allergies: string
    medical_history: string
    insurance_number: string
    id_number: string
    nationality: string
    occupation: string
    marital_status: string
  }
  
  let formData: PatientData = {
    patient_id: '',
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    allergies: '',
    medical_history: '',
    insurance_number: '',
    id_number: '',
    nationality: '',
    occupation: '',
    marital_status: ''
  }
  
  let loading = false
  let errors: Record<string, string> = {}
  
  // Generate patient ID automatically
  function generatePatientId(): string {
    const prefix = 'HMS'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `${prefix}${timestamp}${random}`
  }
  
  // Initialize with generated patient ID
  formData.patient_id = generatePatientId()
  
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = ['male', 'female', 'other']
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed']
  
  function validateForm(): boolean {
    errors = {}
    
    // Required field validation
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required'
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required'
    if (!formData.gender) errors.gender = 'Gender is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.emergency_contact_name.trim()) errors.emergency_contact_name = 'Emergency contact name is required'
    if (!formData.emergency_contact_phone.trim()) errors.emergency_contact_phone = 'Emergency contact phone is required'
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Phone validation
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    // Age validation
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age > 150 || birthDate > today) {
        errors.date_of_birth = 'Please enter a valid date of birth'
      }
    }
    
    return Object.keys(errors).length === 0
  }
  
  async function handleSubmit() {
    if (!validateForm()) return
    
    loading = true
    
    try {
      if (isDemoMode) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Demo mode: Patient registered', formData)
        dispatch('patientRegistered', { patient: formData })
        dispatch('close')
      } else {
        const { data, error } = await supabase
          .from('patients')
          .insert([{
            patient_id: formData.patient_id,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email || null,
            address: formData.address,
            emergency_contact: formData.emergency_contact_name,
            emergency_phone: formData.emergency_contact_phone,
            blood_group: formData.blood_group || null,
            allergies: formData.allergies || null,
            medical_history: formData.medical_history || null,
            insurance_number: formData.insurance_number || null,
            id_number: formData.id_number || null,
            nationality: formData.nationality || null,
            occupation: formData.occupation || null,
            marital_status: formData.marital_status || null,
            status: 'registered'
          }])
          .select()
          .single()
        
        if (error) throw error
        
        dispatch('patientRegistered', { patient: data })
        dispatch('close')
      }
    } catch (error) {
      console.error('Error registering patient:', error)
      errors.submit = 'Failed to register patient. Please try again.'
    } finally {
      loading = false
    }
  }
  
  function handleClose() {
    dispatch('close')
  }
</script>

<div class="modal-overlay" on:click={handleClose}>
  <div class="modal-content" on:click|stopPropagation>
    <div class="modal-header">
      <div class="header-left">
        <h2>Patient Registration</h2>
        <p>Register a new patient in the system</p>
      </div>
      <button class="close-button" on:click={handleClose}>
        <X size={24} />
      </button>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="registration-form">
      {#if errors.submit}
        <div class="error-alert">
          {errors.submit}
        </div>
      {/if}
      
      <!-- Basic Information -->
      <div class="form-section">
        <h3>
          <User size={20} />
          Basic Information
        </h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="patient_id">Patient ID</label>
            <input
              type="text"
              id="patient_id"
              bind:value={formData.patient_id}
              readonly
              class="readonly"
            />
            <small>Automatically generated unique identifier</small>
          </div>
          
          <div class="form-group">
            <label for="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              bind:value={formData.full_name}
              class:error={errors.full_name}
              required
            />
            {#if errors.full_name}
              <span class="error-text">{errors.full_name}</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="date_of_birth">Date of Birth *</label>
            <input
              type="date"
              id="date_of_birth"
              bind:value={formData.date_of_birth}
              class:error={errors.date_of_birth}
              required
            />
            {#if errors.date_of_birth}
              <span class="error-text">{errors.date_of_birth}</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="gender">Gender *</label>
            <select
              id="gender"
              bind:value={formData.gender}
              class:error={errors.gender}
              required
            >
              <option value="">Select Gender</option>
              {#each genders as gender}
                <option value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
              {/each}
            </select>
            {#if errors.gender}
              <span class="error-text">{errors.gender}</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="blood_group">Blood Group</label>
            <select id="blood_group" bind:value={formData.blood_group}>
              <option value="">Select Blood Group</option>
              {#each bloodGroups as bloodGroup}
                <option value={bloodGroup}>{bloodGroup}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="marital_status">Marital Status</label>
            <select id="marital_status" bind:value={formData.marital_status}>
              <option value="">Select Status</option>
              {#each maritalStatuses as status}
                <option value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
      
      <!-- Contact Information -->
      <div class="form-section">
        <h3>
          <Phone size={20} />
          Contact Information
        </h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              bind:value={formData.phone}
              class:error={errors.phone}
              required
            />
            {#if errors.phone}
              <span class="error-text">{errors.phone}</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              bind:value={formData.email}
              class:error={errors.email}
            />
            {#if errors.email}
              <span class="error-text">{errors.email}</span>
            {/if}
          </div>
          
          <div class="form-group full-width">
            <label for="address">Address *</label>
            <textarea
              id="address"
              bind:value={formData.address}
              class:error={errors.address}
              rows="3"
              required
            ></textarea>
            {#if errors.address}
              <span class="error-text">{errors.address}</span>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Emergency Contact -->
      <div class="form-section">
        <h3>
          <Phone size={20} />
          Emergency Contact
        </h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="emergency_contact_name">Contact Name *</label>
            <input
              type="text"
              id="emergency_contact_name"
              bind:value={formData.emergency_contact_name}
              class:error={errors.emergency_contact_name}
              required
            />
            {#if errors.emergency_contact_name}
              <span class="error-text">{errors.emergency_contact_name}</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="emergency_contact_phone">Contact Phone *</label>
            <input
              type="tel"
              id="emergency_contact_phone"
              bind:value={formData.emergency_contact_phone}
              class:error={errors.emergency_contact_phone}
              required
            />
            {#if errors.emergency_contact_phone}
              <span class="error-text">{errors.emergency_contact_phone}</span>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Additional Information -->
      <div class="form-section">
        <h3>
          <FileText size={20} />
          Additional Information
        </h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="nationality">Nationality</label>
            <input
              type="text"
              id="nationality"
              bind:value={formData.nationality}
            />
          </div>
          
          <div class="form-group">
            <label for="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              bind:value={formData.occupation}
            />
          </div>
          
          <div class="form-group">
            <label for="id_number">ID Number</label>
            <input
              type="text"
              id="id_number"
              bind:value={formData.id_number}
            />
          </div>
          
          <div class="form-group">
            <label for="insurance_number">Insurance Number</label>
            <input
              type="text"
              id="insurance_number"
              bind:value={formData.insurance_number}
            />
          </div>
          
          <div class="form-group full-width">
            <label for="allergies">Known Allergies</label>
            <textarea
              id="allergies"
              bind:value={formData.allergies}
              rows="2"
              placeholder="List any known allergies or medications to avoid"
            ></textarea>
          </div>
          
          <div class="form-group full-width">
            <label for="medical_history">Medical History</label>
            <textarea
              id="medical_history"
              bind:value={formData.medical_history}
              rows="3"
              placeholder="Brief medical history or relevant conditions"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="cancel-button" on:click={handleClose}>
          Cancel
        </button>
        <button type="submit" class="submit-button" disabled={loading}>
          {#if loading}
            <div class="spinner"></div>
            Registering...
          {:else}
            <Save size={20} />
            Register Patient
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

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
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid #e5e7eb;
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
  
  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background: #e5e7eb;
    color: #374151;
  }
  
  .registration-form {
    padding: 1rem 2rem 2rem 2rem;
  }
  
  .error-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
  }
  
  .form-section {
    margin-bottom: 2rem;
  }
  
  .form-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
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
  
  .form-group input.readonly {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }
  
  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: #dc2626;
  }
  
  .form-group small {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .error-text {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #dc2626;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .cancel-button {
    padding: 0.75rem 1.5rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cancel-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .submit-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .modal-content {
      margin: 0.5rem;
      max-height: 95vh;
    }
    
    .modal-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
    }
    
    .registration-form {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
    }
    
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
</style>