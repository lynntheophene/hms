<script lang="ts">
import { supabase } from '../../supabase';
import { onMount } from 'svelte';
let enquiry = {
  patient_name: '',
  phone: '',
  email: '',
  enquiry_type: 'appointment',
  department: '',
  preferred_date: '',
  preferred_time: '',
  message: ''
};

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();
let submitting = false;
let error = '';
let success = false;

async function submitEnquiry() {
  submitting = true;
  error = '';
  success = false;
  const { data, error: err } = await supabase.from('enquiries').insert([enquiry]).select().single();
  submitting = false;
  if (err) {
    error = err.message;
  } else {
    success = true;
    dispatch('submitted', data);
    enquiry = {
      patient_name: '',
      phone: '',
      email: '',
      enquiry_type: 'appointment',
      department: '',
      preferred_date: '',
      preferred_time: '',
      message: ''
    };
  }
}
</script>

<form on:submit|preventDefault={submitEnquiry}>
  <h2>Patient Enquiry</h2>
  <input placeholder="Name" bind:value={enquiry.patient_name} required />
  <input placeholder="Phone" bind:value={enquiry.phone} required />
  <input placeholder="Email" bind:value={enquiry.email} type="email" />
  <select bind:value={enquiry.enquiry_type}>
    <option value="appointment">Appointment</option>
    <option value="general">General</option>
    <option value="emergency">Emergency</option>
    <option value="follow_up">Follow Up</option>
    <option value="complaint">Complaint</option>
  </select>
  <input placeholder="Department" bind:value={enquiry.department} required />
  <input type="date" bind:value={enquiry.preferred_date} />
  <input type="time" bind:value={enquiry.preferred_time} />
  <textarea placeholder="Message" bind:value={enquiry.message} required></textarea>
  <button type="submit" disabled={submitting}>Submit</button>
  {#if error}<div class="error">{error}</div>{/if}
  {#if success}<div class="success">Enquiry submitted!</div>{/if}
</form>
