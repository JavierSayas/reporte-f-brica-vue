<script setup>
import { ref, computed, watch } from 'vue';
import { useFirebase } from './composables/useFirebase.js';

// Importa los nuevos componentes que has creado
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
  const freshReportData = {};
  // Asegura que cada zona tenga un objeto para evitar errores
  zones.forEach(zone => {
    freshReportData[zone] = { ...currentDayData[zone] };
    // Caso especial para ZAC para asegurar que personal_incidents es un array
    if (zone === 'ZAC' && !Array.isArray(freshReportData[zone].personal_incidents)) {
        freshReportData[zone].personal_incidents = [];
    }
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
    for (const zone of zones) {
        const zoneData = { ...(reportData.value[zone] || {}) };
        if (zone === 'ZAC' && zoneData.personal_incidents) {
            zoneData.personal_incidents = zoneData.personal_incidents.filter(inc => inc && inc.name && inc.name.trim() !== '');
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
  
  let text = `Reporte Diario de Fábrica - Fecha: ${report.date || 'N/A'}\n\n`;

    // Muelles
    text += `--- Muelles ---\n`;
    text += `Incidencias: ${report.Muelles?.incidencias || 'N/A'}\n`;
    text += `¿Ha faltado alguien?: ${report.Muelles?.falta_alguien === 'si' ? 'Sí' : (report.Muelles?.falta_alguien === 'no' ? 'No' : 'N/A')}\n`;
    if (report.Muelles?.falta_alguien === 'si') {
        text += `Nombre de la persona que ha faltado: ${report.Muelles?.nombre_falta || 'N/A'}\n`;
    }
    text += `\n`;

    // ZBR
    text += `--- ZBR ---\n`;
    text += `Coordinador ZBR: ${report.ZBR?.coordinador_zbr || 'N/A'}\n`;
    text += `Materia Prima: ${report.ZBR?.materia_prima_estado === 'buen_estado' ? 'Buen Estado' : (report.ZBR?.materia_prima_estado === 'mal_estado' ? 'Mal Estado' : 'N/A')}\n`;
    if (report.ZBR?.materia_prima_estado === 'mal_estado') {
        text += `Más datos sobre el mal estado: ${report.ZBR?.materia_prima_detalles || 'N/A'}\n`;
    }
    text += `Incidencias: ${report.ZBR?.incidencias || 'N/A'}\n`;
    text += `\n`;

    // ZAC
    text += `--- ZAC ---\n`;
    text += `Coordinador ZAC: ${report.ZAC?.coordinador_zac || 'N/A'}\n`;
    text += `Incidencias en máquinas: ${report.ZAC?.incidencias_maquinas || 'N/A'}\n`;
    text += `¿Ha habido incidencias con el personal?: ${report.ZAC?.ha_habido_incidencias_personal === 'si' ? 'Sí' : (report.ZAC?.ha_habido_incidencias_personal === 'no' ? 'No' : 'N/A')}\n`;
    if (report.ZAC?.ha_habido_incidencias_personal === 'si' && report.ZAC?.personal_incidents?.length > 0) {
        text += `Incidencias de Personal:\n`;
        report.ZAC.personal_incidents.forEach(incident => {
            text += `  - ${incident.name || 'N/A'} (${incident.type === 'llega_tarde' ? 'Llega Tarde' : (incident.type === 'no_ha_venido' ? 'No Ha Venido' : 'N/A')})\n`;
        });
    }
    text += `Estado de la Fruta: ${report.ZAC?.estado_fruta_estado === 'buen_estado' ? 'Buen Estado' : (report.ZAC?.estado_fruta_estado === 'mal_estado' ? 'Mal Estado' : 'N/A')}\n`;
    if (report.ZAC?.estado_fruta_estado === 'mal_estado') {
        text += `Más datos sobre el mal estado de la fruta: ${report.ZAC?.fruta_detalles || 'N/A'}\n`;
    }
    text += `\n`;

    // Empaquetado
    text += `--- Empaquetado ---\n`;
    text += `Coordinador: ${report.Empaquetado?.coordinador || 'N/A'}\n`;
    text += `Incidencias: ${report.Empaquetado?.incidencias || 'N/A'}\n`;
    text += `\n`;

    // Maquinistas
    text += `--- Maquinistas ---\n`;
    text += `Maquinista: ${report.Maquinistas?.maquinista || 'N/A'}\n`;
    text += `Incidencias: ${report.Maquinistas?.incidencias || 'N/A'}\n`;
    text += `\n`;
    
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
      <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6" v-if="reportData[selectedZone]">
        <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Reporte de la Zona: {{ selectedZone }}
        </h2>
        <component :is="activeFormComponent" v-model="reportData[selectedZone]" />
      </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <button @click="handleSubmitReport" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl">
          Guardar Reporte Diario
        </button>
        <button @click="handleGenerateTextReport" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl">
          Generar Reporte de Texto
        </button>
      </div>
      
      <!-- Mensaje para el usuario -->
      <div v-if="message" class="mt-4 p-3 rounded-lg text-center font-semibold" :class="message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
        {{ message }}
      </div>

      <!-- Componente Modal -->
      <TextReportModal 
        v-if="showTextReportModal" 
        :content="textReportContent" 
        @close="showTextReportModal = false" 
        @copy="handleCopyReport" 
      />
      
      <!-- Componente Lista de Reportes -->
      <ReportList 
        :reports="dailyReports" 
        @select-date="date => currentDate = date" 
        @delete-report="handleDeleteReport"
      />
    </div>
  </div>
</template>
