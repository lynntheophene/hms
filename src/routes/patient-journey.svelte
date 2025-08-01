<script lang="ts">
import EnquiryForm from '$lib/components/Patients/EnquiryForm.svelte';
import AppointmentBooking from '$lib/components/Patients/AppointmentBooking.svelte';
import PatientRegistration from '$lib/components/Patients/PatientRegistration.svelte';
import AdmissionForm from '$lib/components/Patients/AdmissionForm.svelte';
import DischargeForm from '$lib/components/Patients/DischargeForm.svelte';

let step = 1;
let enquiryData = null;
let patientData = null;
let admissionData = null;

function handleEnquirySubmitted(e) {
  enquiryData = e.detail;
  step = 2;
}
function handlePatientRegistered(e) {
  patientData = e.detail;
  step = 3;
}
function handleAppointmentBooked(e) {
  step = 4;
}
function handleAdmitted(e) {
  admissionData = e.detail;
  step = 5;
}
function handleDischarged() {
  step = 1;
  enquiryData = null;
  patientData = null;
  admissionData = null;
}
</script>

<h1>Patient Journey</h1>

{#if step === 1}
  <EnquiryForm on:submitted={handleEnquirySubmitted} />
{/if}
{#if step === 2}
  <PatientRegistration {enquiryData} on:registered={handlePatientRegistered} />
{/if}
{#if step === 3}
  <AppointmentBooking {patientData} on:booked={handleAppointmentBooked} />
  <button on:click={() => step = 4}>Skip to Admission</button>
{/if}
{#if step === 4}
  <AdmissionForm {patientData} on:admitted={handleAdmitted} />
{/if}
{#if step === 5}
  <DischargeForm {admissionData} on:discharged={handleDischarged} />
{/if}

<style>
h1 { margin-bottom: 1rem; }
button { margin-top: 1rem; }
</style>
