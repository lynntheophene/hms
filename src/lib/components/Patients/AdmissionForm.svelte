<script lang="ts">
import { supabase } from '../../supabase';
let admission = {
  patient_id: '',
  room_id: '',
  doctor_id: '',
  admission_date: '',
  admission_type: 'planned',
  diagnosis: '',
  treatment_plan: ''
};
let submitting = false;
let error = '';
let success = false;

async function admitPatient() {
  submitting = true;
  error = '';
  success = false;
  const { data, error: err } = await supabase.from('admissions').insert([admission]);
  submitting = false;
  if (err) {
    error = err.message;
  } else {
    success = true;
    admission = {
      patient_id: '',
      room_id: '',
      doctor_id: '',
      admission_date: '',
      admission_type: 'planned',
      diagnosis: '',
      treatment_plan: ''
    };
  }
}
</script>

<form on:submit|preventDefault={admitPatient}>
  <h2>Admit Patient</h2>
  <input placeholder="Patient ID" bind:value={admission.patient_id} required />
  <input placeholder="Room ID" bind:value={admission.room_id} required />
  <input placeholder="Doctor ID" bind:value={admission.doctor_id} required />
  <input type="datetime-local" bind:value={admission.admission_date} required />
  <select bind:value={admission.admission_type}>
    <option value="planned">Planned</option>
    <option value="emergency">Emergency</option>
    <option value="transfer">Transfer</option>
  </select>
  <input placeholder="Diagnosis" bind:value={admission.diagnosis} required />
  <textarea placeholder="Treatment Plan" bind:value={admission.treatment_plan}></textarea>
  <button type="submit" disabled={submitting}>Admit</button>
  {#if error}<div class="error">{error}</div>{/if}
  {#if success}<div class="success">Patient admitted!</div>{/if}
</form>
