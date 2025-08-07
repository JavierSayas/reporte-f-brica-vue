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

const { loading, dailyReports, saveReport, deleteReport } = useFirebase();

const zones = ['Muelles', 'ZBR', 'ZAC', 'Empaquetado', 'Maquinistas'];
const selectedZone = ref('Muelles');
const currentDate = ref(new Date().toISOString().split('T')[0]);
const message = ref('');
const showTextReportModal = ref(false);
const textReportContent = ref('');
const whatsappReadyText = ref('');
const reportData = ref({});

watch([currentDate, dailyReports], () => {
  whatsappReadyText.value = '';
  message.value = '';
  const currentDayData = dailyReports.value[currentDate.value] || {};
  const newReportData = {};
  zones.forEach(zone => {
    newReportData[zone] = { ...(currentDayData[zone] ?? {}) }; 
    if (zone === 'ZAC' && !Array.isArray(newReportData[zone].personal_incidents)) {
        newReportData[zone].personal_incidents = [];
    }
  });
  reportData.value = newReportData;
}, { immediate: true, deep: true });

const formComponents = {
  Muelles: FormMuelles,
  ZBR: FormZBR,
  ZAC: FormZAC,
  Empaquetado: FormEmpaquetado,
  Maquinistas: FormMaquinistas,
};
const activeFormComponent = computed(() => formComponents[selectedZone.value]);

const generateSummaryText = (report) => {
  if (!report) return 'No hay datos para generar el reporte.';
  const formatFreeTextWithBullets = (label, text) => {
    if (text && text.trim() !== '') {
      const lines = text.trim().split('\n').filter(line => line.trim() !== '').map(line => `• ${line.trim()}`);
      const formattedText = lines.join('\n');
      return `${label}:\n${formattedText}\n\n`;
    }
    return `${label}: N/A\n\n`;
  };
  let text = `*Reporte Diario de Fábrica - Fecha: ${report.date || currentDate.value}*\n\n`;
  const muelles = report.Muelles || {};
  text += `*--- Muelles ---*\n`;
  text += `¿Ha faltado alguien?: ${muelles.falta_alguien === 'si' ? 'Sí' : (muelles.falta_alguien === 'no' ? 'No' : 'N/A')}\n`;
  if (muelles.falta_alguien === 'si') { text += `Nombre: ${muelles.nombre_falta || 'N/A'}\n`; }
  text += formatFreeTextWithBullets('Incidencias', muelles.incidencias);
  const zbr = report.ZBR || {};
  text += `*--- ZBR ---*\n`;
  text += `Coordinador: ${zbr.coordinador_zbr || 'N/A'}\n`;
  const mpEstado = zbr.materia_prima_estado ? zbr.materia_prima_estado.replace('_', ' ') : 'N/A';
  text += `Materia Prima: ${mpEstado.charAt(0).toUpperCase() + mpEstado.slice(1)}\n`;
  if (zbr.materia_prima_estado === 'mal_estado' || zbr.materia_prima_estado === 'regular') { text += formatFreeTextWithBullets('Detalles Materia Prima', zbr.materia_prima_detalles); } else { text += '\n'; }
  text += formatFreeTextWithBullets('Incidencias', zbr.incidencias);
  const zac = report.ZAC || {};
  text += `*--- ZAC ---*\n`;
  text += `Coordinador: ${zac.coordinador_zac || 'N/A'}\n`;
  text += `¿Incidencias personal?: ${zac.ha_habido_incidencias_personal === 'si' ? 'Sí' : (zac.ha_habido_incidencias_personal === 'no' ? 'No' : 'N/A')}\n`;
  if (zac.ha_habido_incidencias_personal === 'si' && zac.personal_incidents?.length > 0) { zac.personal_incidents.forEach(incident => { text += `  - ${incident.name} (${incident.type === 'llega_tarde' ? 'Llega Tarde' : 'No Ha Venido'})\n`; }); }
  const frutaEstado = zac.estado_fruta_estado ? zac.estado_fruta_estado.replace('_', ' ') : 'N/A';
  text += `Estado Fruta: ${frutaEstado.charAt(0).toUpperCase() + frutaEstado.slice(1)}\n`;
  if (zac.estado_fruta_estado === 'mal_estado' || zac.estado_fruta_estado === 'regular') { text += formatFreeTextWithBullets('Detalles Fruta', zac.fruta_detalles); }
  text += formatFreeTextWithBullets('Incidencias en máquinas', zac.incidencias_maquinas);
  const empaquetado = report.Empaquetado || {};
  text += `*--- Empaquetado ---*\n`;
  text += `Coordinador: ${empaquetado.coordinador || 'N/A'}\n`;
  text += formatFreeTextWithBullets('Incidencias', empaquetado.incidencias);
  const maquinistas = report.Maquinistas || {};
  text += `*--- Maquinistas ---*\n`;
  text += `Maquinista: ${maquinistas.maquinista || 'N/A'}\n`;
  text += formatFreeTextWithBullets('Incidencias', maquinistas.incidencias);
  return text.trim();
};

const handleSubmitReport = async () => {
  whatsappReadyText.value = '';
  try {
    const reportToSave = { date: currentDate.value };
    zones.forEach(zone => {
      const zoneData = { ...(reportData.value[zone] || {}) };
      if (zone === 'ZAC' && zoneData.personal_incidents) {
        zoneData.personal_incidents = zoneData.personal_incidents.filter(inc => inc && inc.name && inc.name.trim() !== '');
      }
      reportToSave[zone] = zoneData;
    });
    await saveReport(currentDate.value, reportToSave);
    message.value = 'Reporte guardado con éxito!';
    whatsappReadyText.value = generateSummaryText(reportToSave);
  } catch (error) {
    message.value = `Error al guardar: ${error.message}`;
  }
};

// --- WHATSAPP URL AHORA ES UNA PROPIEDAD COMPUTADA ---
// Es más eficiente y el código del template queda más limpio.
const whatsappUrl = computed(() => {
  if (!whatsappReadyText.value) return '#'; // Devuelve un enlace inofensivo si no hay texto

  const encodedText = encodeURIComponent(whatsappReadyText.value);
  
  // Mantenemos la lógica de móvil/desktop si quieres, pero wa.me/ funciona bien en ambos
  // Para máxima compatibilidad, dejaremos la versión simple.
  return `https://wa.me/?text=${encodedText}`;
});

const handleDeleteReport = async (date) => {
  if (confirm(`¿Seguro que quieres eliminar el reporte del ${date}?`)) {
    await deleteReport(date).catch(err => message.value = `Error al eliminar: ${err.message}`);
    message.value = `Reporte del ${date} eliminado.`;
  }
};
const handleGenerateTextReport = () => {
  const reportToSummarize = { date: currentDate.value, ...reportData.value };
  textReportContent.value = generateSummaryText(reportToSummarize);
  showTextReportModal.value = true;
};
const handleCopyReport = async () => {
  await navigator.clipboard.writeText(textReportContent.value);
  message.value = 'Reporte copiado!';
  setTimeout(() => (message.value = ''), 3000);
};
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-xl font-semibold text-gray-700">Cargando aplicación...</div>
  </div>

  <div v-else class="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
    <div class="bg-white shadow-lg rounded-xl w-full max-w-4xl border border-gray-200">
      <header class="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <p class="text-sm text-gray-600">
          <span class="hidden sm:inline">Conectado como:</span>
          <strong class="font-mono">{{ userEmail }}</strong>
        </p>
        <!-- ... (botones de cambiar contraseña y logout) ... -->
      </header>
      
      <main class="p-6">
        <h1 class="text-3xl font-extrabold text-center text-indigo-800 mb-6">Reporte Diario de Zonas de Fábrica</h1>
        
        <div class="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <label for="report-date" class="text-gray-700 font-semibold">Seleccionar Fecha:</label>
          <input type="date" id="report-date" class="shadow appearance-none border rounded-lg py-2 px-3" v-model="currentDate" />
        </div>

        <ZoneSelector :zones="zones" v-model="selectedZone" />

        <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6" v-if="reportData[selectedZone]">
          <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">
            Reporte de la Zona: {{ selectedZone }}
          </h2>
          <component 
            :is="activeFormComponent" 
            :key="currentDate" 
            v-if="reportData[selectedZone]" 
            v-model="reportData[selectedZone]" 
          />
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button @click="handleSubmitReport" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl">Guardar Reporte Diario</button>
          <button @click="handleGenerateTextReport" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl">Generar Reporte de Texto</button>
        </div>
        
        <!-- --- SECCIÓN MODIFICADA: AHORA USAMOS UN ENLACE <a> EN LUGAR DE UN BOTÓN --- -->
        <div v-if="message" class="mt-4 p-3 rounded-lg text-center font-semibold" :class="message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
          <p>{{ message }}</p>
          
          <!-- Se muestra el enlace de WhatsApp solo si hay un reporte listo para enviar -->
          <a 
            v-if="whatsappReadyText" 
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Enviar por WhatsApp
          </a>
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
      </main>
    </div>
  </div>
</template>
