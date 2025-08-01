<script lang="ts">
import { supabase } from '../../supabase';
let admission_id = '';
let discharge_date = '';
let submitting = false;
let error = '';
let success = false;

async function dischargePatient() {
  submitting = true;
  error = '';
  success = false;
  const { data, error: err } = await supabase.from('admissions').update({
    discharge_date,
    status: 'discharged'
  }).eq('id', admission_id);
  submitting = false;
  if (err) {
    error = err.message;
  } else {
    success = true;
    admission_id = '';
    discharge_date = '';
  }
}
</script>

<form on:submit|preventDefault={dischargePatient}>
  <h2>Discharge Patient</h2>
  <input placeholder="Admission ID" bind:value={admission_id} required />
  <input type="datetime-local" bind:value={discharge_date} required />
  <button type="submit" disabled={submitting}>Discharge</button>
  {#if error}<div class="error">{error}</div>{/if}
  {#if success}<div class="success">Patient discharged!</div>{/if}
</form>
