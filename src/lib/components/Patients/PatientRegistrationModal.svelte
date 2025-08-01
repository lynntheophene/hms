<script lang="ts">
import PatientRegistration from './PatientRegistration.svelte';
export let enquiryData: Record<string, any> | null = null;
export let open = false;
export let onClose = () => {};
export let userRole = '';
import { supabase } from '../../supabase';
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

function handleRegistered(e: any) {
  dispatch('close');
  onClose();
}

async function markAsCompleted() {
  if (!enquiryData || !enquiryData.id) return;
  await supabase
    .from('enquiries')
    .update({ status: 'completed' })
    .eq('id', enquiryData.id);
  dispatch('close');
  onClose();
}
</script>

{#if open}
  <div class="modal-backdrop" role="presentation" tabindex="0" on:click={onClose}></div>
  <div class="modal-wrapper">
    <PatientRegistration on:registered={handleRegistered} />
    {#if (userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin') && enquiryData}
      <button class="complete-btn" on:click={markAsCompleted} style="margin-top:1rem;">Mark as Completed</button>
    {/if}
  </div>
{/if}

<style>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1000;
}
.modal-wrapper {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 1001;
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}
.complete-btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.complete-btn:hover {
  background: #1b5e20;
}
</style>
