<script setup>
import { ref, computed, watch } from 'vue';
import { useFirebase } from './composables/useFirebase.js';

// Importa los componentes
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

const reportData = ref({});

// ---- SINCRONIZACIÓN DE DATOS ----
watch([currentDate, dailyReports], () => {
  const currentDayData = dailyReports.value[currentDate.value] || {};
  const freshReportData = {};
  zones.forEach(zone => {
    freshReportData[zone] = { ...currentDayData[zone] };
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

// ---- NUEVA FUNCIÓN DE AYUDA PARA GENERAR EL TEXTO DEL REPORTE ----
const generateSummaryText = (report) => {
  if (!report) return 'No hay datos para generar el reporte.';
  
  let text = `*Reporte Diario de Fábrica - Fecha: ${report.date || 'N/A'}*\n\n`;

  // Muelles
  const muelles = report.Muelles || {};
  text += `*--- Muelles ---*\n`;
  text += `Incidencias: ${muelles.incidencias || 'N/A'}\n`;
  text += `¿Ha faltado alguien?: ${muelles.falta_alguien === 'si' ? 'Sí' : (muelles.falta_alguien === 'no' ? 'No' : 'N/A')}\n`;
  if (muelles.falta_alguien === 'si') {
      text += `Nombre: ${muelles.nombre_falta || 'N/A'}\n`;
  }
  text += `\n`;

  // ZBR
  const zbr = report.ZBR || {};
  text += `*--- ZBR ---*\n`;
  text += `Coordinador: ${zbr.coordinador_zbr || 'N/A'}\n`;
  text += `Materia Prima: ${zbr.materia_prima_estado === 'buen_estado' ? 'Buen Estado' : zbr.materia_prima_estado === 'mal_estado' ? 'Mal Estado' : zbr.materia_prima_estado === 'regular' ? 'Regular' : 'N/A'}\n`;
  if (zbr.materia_prima_estado === 'mal_estado' || zbr.materia_prima_estado === 'regular') {
      text += `Detalles: ${zbr.materia_prima_detalles || 'N/A'}\n`;
  }
  text += `Incidencias: ${zbr.incidencias || 'N/A'}\n`;
  text += `\n`;

  // ZAC
  const zac = report.ZAC || {};
  text += `*--- ZAC ---*\n`;
  text += `Coordinador: ${zac.coordinador_zac || 'N/A'}\n`;
  text += `Incidencias máquinas: ${zac.incidencias_maquinas || 'N/A'}\n`;
  text += `¿Incidencias personal?: ${zac.ha_habido_incidencias_personal === 'si' ? 'Sí' : (zac.ha_habido_incidencias_personal === 'no' ? 'No' : 'N/A')}\n`;
  if (zac.ha_habido_incidencias_personal === 'si' && zac.personal_incidents?.length > 0) {
      zac.personal_incidents.forEach(incident => {
          text += `  - ${incident.name || 'N/A'} (${incident.type === 'llega_tarde' ? 'Llega Tarde' : 'No Ha Venido'})\n`;
      });
  }
  text += `Estado Fruta: ${zac.estado_fruta_estado === 'buen_estado' ? 'Buen Estado' : zac.estado_fruta_estado === 'mal_estado' ? 'Mal Estado' : zac.estado_fruta_estado === 'regular' ? 'Regular' : 'N/A'}\n`;
  if (zac.estado_fruta_estado === 'mal_estado' || zac.estado_fruta_estado === 'regular') {
      text += `Detalles Fruta: ${zac.fruta_detalles || 'N/A'}\n`;
  }
  text += `\n`;

  // Empaquetado
  const empaquetado = report.Empaquetado || {};
  text += `*--- Empaquetado ---*\n`;
  text += `Coordinador: ${empaquetado.coordinador || 'N/A'}\n`;
  text += `Incidencias: ${empaquetado.incidencias || 'N/A'}\n`;
  text += `\n`;

  // Maquinistas
  const maquinistas = report.Maquinistas || {};
  text += `*--- Maquinistas ---*\n`;
  text += `Maquinista: ${maquinistas.maquinista || 'N/A'}\n`;
  text += `Incidencias: ${maquinistas.incidencias || 'N/A'}\n`;

  return text;
};

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

    // 1. Guardar en Firebase
    await saveReport(currentDate.value, reportToSave);
    message.value = 'Reporte guardado con éxito! Abriendo WhatsApp...';

    // 2. --- NUEVA LÓGICA PARA ENVIAR POR WHATSAPP ---
    const phoneNumber = '34681335719'; // Número sin el '+' ni espacios
    const summaryText = generateSummaryText(reportToSave); // Usamos la nueva función de ayuda
    const encodedText = encodeURIComponent(summaryText); // Codificamos el texto para la URL
    
    // 3. Construir y abrir la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank'); // Abre en una nueva pestaña

    setTimeout(() => { message.value = ''; }, 4000);
  } catch (error) {
    message.value = `Error al guardar: ${error.message}`;
  }
};

const handleDeleteReport = async (date) => {
  if (confirm(`¿Seguro que quieres eliminar el reporte del ${date}?`)) {
    await deleteReport(date).catch(err => message.value = `Error al eliminar: ${err.message}`);
    message.value = `Reporte del ${date} eliminado.`;
  }
};

const handleGenerateTextReport = () => {
  const report = dailyReports.value[currentDate.value];
  if (!report) {
    message.value = 'No hay reporte para generar.';
    return;
  }
  textReportContent.value = generateSummaryText(report); // Reutilizamos la función de ayuda
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
  <!-- El template no cambia, lo incluyo completo por si acaso -->
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-xl font-semibold text-gray-700">Cargando aplicación...</div>
  </div>

  <div v-else class="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl border border-gray-200">
      <h1 class="text-3xl font-extrabold text-center text-indigo-800 mb-6">
        Reporte Diario de Zonas de Fábrica
      </h1>
      
      <div class="mb-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <label for="report-date" class="text-gray-700 font-semibold">Seleccionar Fecha:</label>
        <input
          type="date"
          id="report-date"
          class="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700"
          v-model="currentDate"
        />
      </div>

      <ZoneSelector :zones="zones" v-model="selectedZone" />

      <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6" v-if="reportData[selectedZone]">
        <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Reporte de la Zona: {{ selectedZone }}
        </h2>
        <component :is="activeFormComponent" v-model="reportData[selectedZone]" />
      </div>

      <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <button @click="handleSubmitReport" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl">
          Guardar Reporte Diario
        </button>
        <button @click="handleGenerateTextReport" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl">
          Generar Reporte de Texto
        </button>
      </div>
      
      <div v-if="message" class="mt-4 p-3 rounded-lg text-center font-semibold" :class="message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
        {{ message }}
      </div>

      <TextReportModal 
        v-if="showTextReportModal" 
        :content="textReportContent" 
        @close="showTextReportModal = false" 
        @copy="handleCopyReport" 
      />
      
      <ReportList 
        :reports="dailyReports" 
        @select-date="date => currentDate = date" 
        @delete-report="handleDeleteReport"
      />
    </div>
  </div>
</template>
