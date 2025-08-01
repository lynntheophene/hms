<script lang="ts">
import { supabase } from '../../supabase';
let appointment = {
  patient_id: '',
  doctor_id: '',
  appointment_date: '',
  appointment_time: '',
  type: 'consultation',
  notes: ''
};
let submitting = false;
let error = '';
let success = false;

async function bookAppointment() {
  submitting = true;
  error = '';
  success = false;
  const { data, error: err } = await supabase.from('appointments').insert([appointment]);
  submitting = false;
  if (err) {
    error = err.message;
  } else {
    success = true;
    appointment = {
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      type: 'consultation',
      notes: ''
    };
  }
}
</script>

<form on:submit|preventDefault={bookAppointment}>
  <h2>Book Appointment</h2>
  <input placeholder="Patient ID" bind:value={appointment.patient_id} required />
  <input placeholder="Doctor ID" bind:value={appointment.doctor_id} required />
  <input type="date" bind:value={appointment.appointment_date} required />
  <input type="time" bind:value={appointment.appointment_time} required />
  <select bind:value={appointment.type}>
    <option value="consultation">Consultation</option>
    <option value="follow_up">Follow Up</option>
    <option value="emergency">Emergency</option>
    <option value="surgery">Surgery</option>
  </select>
  <textarea placeholder="Notes" bind:value={appointment.notes}></textarea>
  <button type="submit" disabled={submitting}>Book</button>
  {#if error}<div class="error">{error}</div>{/if}
  {#if success}<div class="success">Appointment booked!</div>{/if}
</form>
