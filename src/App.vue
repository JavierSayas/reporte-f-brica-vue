<script setup>
import { ref, computed, watch } from 'vue';
import { useFirebase } from './composables/useFirebase.js';

// Importa los nuevos componentes
import ZoneSelector from './components/ZoneSelector.vue';
import ReportList from './components/ReportList.vue';
import TextReportModal from './components/TextReportModal.vue';
import FormMuelles from './components/forms/FormMuelles.vue';
import FormZBR from './components/forms/FormZBR.vue';
import FormZAC from './components/forms/FormZAC.vue';
import FormEmpaquetado from './components/forms/FormEmpaquetado.vue';
import FormMaquinistas from './components/forms/FormMaquinistas.vue';

// ---- LÓGICA DE FIREBASE ----
const { loading, dailyReports, saveReport, deleteReport } = useFirebase();

// ---- ESTADO PRINCIPAL DE LA UI ----
const zones = ['Muelles', 'ZBR', 'ZAC', 'Empaquetado', 'Maquinistas'];
const selectedZone = ref('Muelles');
const currentDate = ref(new Date().toISOString().split('T')[0]);
const message = ref('');
const showTextReportModal = ref(false);
const textReportContent = ref('');

// Este único objeto contendrá todos los datos de los formularios
const reportData = ref({});

// ---- SINCRONIZACIÓN DE DATOS ----
// Observa la fecha y los datos de Firebase y actualiza el formulario.
watch([currentDate, dailyReports], () => {
  const currentDayData = dailyReports.value[currentDate.value] || {};
  // Asegura que cada zona tenga un objeto para evitar errores
  const freshReportData = {};
  zones.forEach(zone => {
    freshReportData[zone] = { ...currentDayData[zone] }; // Copia para evitar reactividad no deseada
  });
  reportData.value = freshReportData;
}, { immediate: true, deep: true });

// Mapeo para cargar el componente de formulario dinámicamente
const formComponents = {
  Muelles: FormMuelles,
  ZBR: FormZBR,
  ZAC: FormZAC,
  Empaquetado: FormEmpaquetado,
  Maquinistas: FormMaquinistas,
};
const activeFormComponent = computed(() => formComponents[selectedZone.value]);

// ---- MANEJADORES DE EVENTOS ----
const handleSubmitReport = async () => {
  try {
    const reportToSave = { date: currentDate.value };
    // Limpia los datos antes de guardar
    for (const zone of zones) {
        const zoneData = reportData.value[zone] || {};
        if (zone === 'ZAC' && zoneData.personal_incidents) {
            zoneData.personal_incidents = zoneData.personal_incidents.filter(inc => inc.name && inc.name.trim() !== '');
        }
        reportToSave[zone] = zoneData;
    }

    await saveReport(currentDate.value, reportToSave);
    message.value = 'Reporte guardado con éxito!';
    setTimeout(() => { message.value = ''; }, 3000);
  } catch (error) {
    message.value = `Error al guardar: ${error.message}`;
  }
};

const handleDeleteReport = async (date) => {
  if (confirm(`¿Seguro que quieres eliminar el reporte del ${date}?`)) {
    try {
        await deleteReport(date);
        message.value = `Reporte del ${date} eliminado.`;
    } catch(error) {
        message.value = `Error al eliminar: ${error.message}`;
    }
  }
};

const handleGenerateTextReport = () => {
  const report = dailyReports.value[currentDate.value];
  if (!report) {
    message.value = 'No hay reporte para generar.';
    return;
  }
  
  // Aquí la lógica para construir el texto es la misma que tenías
  let text = `Reporte Diario de Fábrica - Fecha: ${report.date || 'N/A'}\n\n`;
  // ... (toda la lógica de construcción de texto que ya tenías)...
  textReportContent.value = text;
  showTextReportModal.value = true;
};

const handleCopyReport = async () => {
  try {
    await navigator.clipboard.writeText(textReportContent.value);
    message.value = 'Reporte copiado!';
  } catch (err) {
    message.value = 'Error al copiar.';
  }
  setTimeout(() => (message.value = ''), 3000);
};

</script>

<template>
  <!-- Pantalla de carga -->
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-xl font-semibold text-gray-700">Cargando aplicación...</div>
  </div>

  <!-- Aplicación principal -->
  <div v-else class="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl border border-gray-200">
      <h1 class="text-3xl font-extrabold text-center text-indigo-800 mb-6">
        Reporte Diario de Zonas de Fábrica
      </h1>
      
      <!-- Selector de Fecha -->
      <div class="mb-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <label for="report-date" class="text-gray-700 font-semibold">Seleccionar Fecha:</label>
        <input
          type="date"
          id="report-date"
          class="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700"
          v-model="currentDate"
        />
      </div>

      <!-- Componente Selector de Zona -->
      <ZoneSelector :zones="zones" v-model="selectedZone" />

      <!-- Contenedor del Formulario Dinámico -->
      <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
        <h2 class="text-
