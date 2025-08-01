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

// NUEVO: Estado para el mensaje de WhatsApp
const whatsappReadyText = ref('');

const reportData = ref({});

// ---- SINCRONIZACIÓN DE DATOS ----
watch([currentDate, dailyReports], () => {
  whatsappReadyText.value = ''; // Limpia el mensaje de WhatsApp al cambiar de día
  message.value = ''; // Limpia mensajes de error
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

// ---- FUNCIÓN DE AYUDA PARA GENERAR EL TEXTO ----
const generateSummaryText = (report) => {
  if (!report) return 'No hay datos para generar el reporte.';
  
  let text = `*Reporte Diario de Fábrica - Fecha: ${report.date || 'N/A'}*\n\n`;
  
  const createSection = (title, data, fields) => {
    text += `*--- ${title} ---*\n`;
    fields.forEach(field => {
        let value = data?.[field.key] || 'N/A';
        if (field.render) value = field.render(data?.[field.key]);
        text += `${field.label}: ${value}\n`;
    });
    text += `\n`;
  };

  createSection('Muelles', report.Muelles, [
      { key: 'incidencias', label: 'Incidencias' },
      { key: 'falta_alguien', label: '¿Ha faltado alguien?', render: v => v === 'si' ? 'Sí' : (v === 'no' ? 'No' : 'N/A') },
      ...(report.Muelles?.falta_alguien === 'si' ? [{ key: 'nombre_falta', label: 'Nombre' }] : [])
  ]);
  // ... (Aquí puedes completar las demás secciones con el mismo patrón si lo deseas)
  // O mantener la versión anterior, que también funciona.
  // Por simplicidad, pego la versión anterior que ya tenías:
    // ZBR
    text += `*--- ZBR ---*\n`;
    text += `Coordinador: ${report.ZBR?.coordinador_zbr || 'N/A'}\n`;
    text += `Materia Prima: ${report.ZBR?.materia_prima_estado?.replace('_', ' ') || 'N/A'}\n`;
    if (report.ZBR?.materia_prima_estado === 'mal_estado' || report.ZBR?.materia_prima_estado === 'regular') {
        text += `Detalles: ${report.ZBR?.materia_prima_detalles || 'N/A'}\n`;
    }
    text += `Incidencias: ${report.ZBR?.incidencias || 'N/A'}\n\n`;
  // ... Y el resto de las zonas
    // ZAC
    const zac = report.ZAC || {};
    text += `*--- ZAC ---*\n`;
    text += `Coordinador: ${zac.coordinador_zac || 'N/A'}\n`;
    text += `Incidencias máquinas: ${zac.incidencias_maquinas || 'N/A'}\n`;
    text += `¿Incidencias personal?: ${zac.ha_habido_incidencias_personal === 'si' ? 'Sí' : 'No'}\n`;
    if (zac.ha_habido_incidencias_personal === 'si' && zac.personal_incidents?.length > 0) {
        zac.personal_incidents.forEach(incident => {
            text += `  - ${incident.name} (${incident.type === 'llega_tarde' ? 'Llega Tarde' : 'No Ha Venido'})\n`;
        });
    }
    text += `\n`;
    // Empaquetado
    text += `*--- Empaquetado ---*\n`;
    text += `Coordinador: ${report.Empaquetado?.coordinador || 'N/A'}\n`;
    text += `Incidencias: ${report.Empaquetado?.incidencias || 'N/A'}\n\n`;
    // Maquinistas
    text += `*--- Maquinistas ---*\n`;
    text += `Maquinista: ${report.Maquinistas?.maquinista || 'N/A'}\n`;
    text += `Incidencias: ${report.Maquinistas?.incidencias || 'N/A'}\n`;
  return text;
};

// ---- MANEJADORES DE EVENTOS ----
const handleSubmitReport = async () => {
  whatsappReadyText.value = ''; // Resetea el botón de WhatsApp
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
    
    // MODIFICADO: En lugar de abrir WhatsApp, preparamos el texto y mostramos el mensaje de éxito
    message.value = 'Reporte guardado con éxito!';
    whatsappReadyText.value = generateSummaryText(reportToSave);

  } catch (error) {
    message.value = `Error al guardar: ${error.message}`;
  }
};

// NUEVA FUNCIÓN: Se ejecuta al hacer clic en el nuevo botón
const sendToWhatsApp = () => {
  if (!whatsappReadyText.value) return;
  const phoneNumber = '34681335719';
  const encodedText = encodeURIComponent(whatsappReadyText.value);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
};

const handleDeleteReport = async (date) => {
  if (confirm(`¿Seguro que quieres eliminar el reporte del ${date}?`)) {
    await deleteReport(date).catch(err => message.value = `Error al eliminar: ${err.message}`);
    message.value = `Reporte del ${date} eliminado.`;
  }
};

const handleGenerateTextReport = () => {
  const report = dailyReports.value[currentDate.value];
  if (!report) { return; }
  textReportContent.value = generateSummaryText(report);
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
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl border border-gray-200">
      <h1 class="text-3xl font-extrabold text-center text-indigo-800 mb-6">
        Reporte Diario de Zonas de Fábrica
      </h1>
      
      <div class="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <label for="report-date" class="text-gray-700 font-semibold">Seleccionar Fecha:</label>
        <input type="date" id="report-date" class="shadow appearance-none border rounded-lg py-2 px-3" v-model="currentDate" />
      </div>

      <ZoneSelector :zones="zones" v-model="selectedZone" />

      <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6" v-if="reportData[selectedZone]">
        <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">Reporte de la Zona: {{ selectedZone }}</h2>
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
      
      <!-- MODIFICADO: Mensaje para el usuario ahora es más inteligente -->
      <div v-if="message" class="mt-4 p-3 rounded-lg text-center font-semibold" :class="message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
        <p>{{ message }}</p>
        <!-- Se muestra el botón de WhatsApp solo si hay un reporte listo para enviar -->
        <button v-if="whatsappReadyText" @click="sendToWhatsApp" class="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
          Enviar por WhatsApp
        </button>
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
