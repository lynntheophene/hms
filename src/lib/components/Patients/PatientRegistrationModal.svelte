<script lang="ts">
import PatientRegistration from './PatientRegistration.svelte';
export let enquiryData = null;
export let open = false;
export let onClose = () => {};
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

function handleRegistered(e) {
  dispatch('close');
  onClose();
}
</script>

{#if open}
  <div class="modal-backdrop" on:click={onClose}></div>
  <div class="modal-wrapper">
    <PatientRegistration {enquiryData} on:registered={handleRegistered} />
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
</style>
