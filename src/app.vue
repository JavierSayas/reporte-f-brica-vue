<script setup>
import { ref, computed, watch } from 'vue';
import { useFirebase } from './composables/useFirebase.js';

// ---- LÓGICA DE FIREBASE ----
const { loading, dailyReports, saveReport, deleteReport, userId } = useFirebase();

// ---- ESTADO DE LA APLICACIÓN ----
const zones = ['Muelles', 'ZBR', 'ZAC', 'Empaquetado', 'Maquinistas'];
const selectedZone = ref('Muelles');
const currentDate = ref(new Date().toISOString().split('T')[0]);
const message = ref('');

// Este objeto contendrá los datos del formulario actual
const reportData = ref({});

// Estados específicos para los formularios (como en React)
const muellesFaltaAlguien = ref(null);
const muellesNombreFalta = ref('');
const zbrMateriaPrimaEstado = ref(null);
const zbrMateriaPrimaDetalles = ref('');
const zacHaHabidoIncidenciasPersonal = ref(null);
const zacPersonalIncidents = ref([]);
const zacEstadoFruta = ref(null);
const zacFrutaDetalles = ref('');

// Modal del reporte de texto
const showTextReportModal = ref(false);
const textReportContent = ref('');

// ---- OBSERVADORES Y LÓGICA DE SINCRONIZACIÓN ----
// Esta función actualiza los campos del formulario cuando cambia la fecha o se cargan nuevos datos
const updateFormState = (newReport) => {
  const report = newReport || {};
  reportData.value = report;

  // Muelles
  muellesFaltaAlguien.value = report.Muelles?.falta_alguien ?? null;
  muellesNombreFalta.value = report.Muelles?.nombre_falta ?? '';

  // ZBR
  zbrMateriaPrimaEstado.value = report.ZBR?.materia_prima_estado ?? null;
  zbrMateriaPrimaDetalles.value = report.ZBR?.materia_prima_detalles ?? '';
  
  // ZAC
  zacHaHabidoIncidenciasPersonal.value = report.ZAC?.ha_habido_incidencias_personal ?? null;
  zacPersonalIncidents.value = report.ZAC?.personal_incidents ?? [];
  if (zacHaHabidoIncidenciasPersonal.value === 'si' && zacPersonalIncidents.value.length === 0) {
    zacPersonalIncidents.value.push({ name: '', type: null });
  }
  zacEstadoFruta.value = report.ZAC?.estado_fruta_estado ?? null;
  zacFrutaDetalles.value = report.ZAC?.fruta_detalles ?? '';
};

// Observa cuando cambia la fecha y actualiza el formulario
watch(currentDate, (newDate) => {
  const newReport = dailyReports.value[newDate];
  updateFormState(newReport);
});

// Observa cuando los reportes de Firebase se actualizan
watch(dailyReports, (newReports) => {
  const newReport = newReports[currentDate.value];
  updateFormState(newReport);
}, { deep: true });

const clearAllFields = () => {
  updateFormState({}); // Simplemente resetea el formulario con un objeto vacío
};

// ---- MANEJADORES DE EVENTOS ----
const handleSubmitReport = async () => {
  // La lógica para construir el objeto es la misma que tenías en React
  const reportToSave = {
      date: currentDate.value,
      Muelles: {
          incidencias: reportData.value.Muelles?.incidencias || '',
          falta_alguien: muellesFaltaAlguien.value,
          nombre_falta: muellesFaltaAlguien.value === 'si' ? muellesNombreFalta.value : '',
      },
      ZBR: {
          coordinador_zbr: reportData.value.ZBR?.coordinador_zbr || '',
          incidencias: reportData.value.ZBR?.incidencias || '',
          materia_prima_estado: zbrMateriaPrimaEstado.value,
          materia_prima_detalles: zbrMateriaPrimaEstado.value === 'mal_estado' ? zbrMateriaPrimaDetalles.value : '',
      },
      ZAC: {
          coordinador_zac: reportData.value.ZAC?.coordinador_zac || '',
          incidencias_maquinas: reportData.value.ZAC?.incidencias_maquinas || '',
          ha_habido_incidencias_personal: zacHaHabidoIncidenciasPersonal.value,
          personal_incidents: zacHaHabidoIncidenciasPersonal.value === 'si' ? zacPersonalIncidents.value.filter(inc => inc.name !== '') : [],
          estado_fruta_estado: zacEstadoFruta.value,
          fruta_detalles: zacEstadoFruta.value === 'mal_estado' ? zacFrutaDetalles.value : '',
      },
      Empaquetado: {
          coordinador: reportData.value.Empaquetado?.coordinador || '',
          incidencias: reportData.value.Empaquetado?.incidencias || '',
      },
      Maquinistas: {
          maquinista: reportData.value.Maquinistas?.maquinista || '',
          incidencias: reportData.value.Maquinistas?.incidencias || '',
      }
  };

  try {
      await saveReport(currentDate.value, reportToSave);
      message.value = 'Reporte guardado con éxito!';
      setTimeout(() => message.value = '', 3000);
      clearAllFields();
  } catch (error) {
      message.value = `Error al guardar: ${error.message}`;
  }
};

const handleGenerateTextReport = () => {
  const report = dailyReports.value[currentDate.value];
  if (!report) {
    message.value = 'No hay reporte para generar.';
    return;
  }
  // La lógica para construir el string de texto es idéntica a la de React.
  // Por brevedad, no la pego aquí, pero la copiarías tal cual.
  // Asumimos que la has copiado y has llenado la variable `text`.
  let text = `Reporte Diario de Fábrica - Fecha: ${report.date || 'N/A'}\n\n`;
  // ... (resto de la lógica de generación de texto) ...
  textReportContent.value = text;
  showTextReportModal.value = true;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(textReportContent.value);
    message.value = 'Reporte copiado!';
  } catch (err) {
    message.value = 'Error al copiar.';
  }
  setTimeout(() => message.value = '', 3000);
};

const handleDeleteClick = async (date) => {
    if (confirm(`¿Seguro que quieres eliminar el reporte del ${date}?`)) {
        try {
            await deleteReport(date);
            message.value = `Reporte del ${date} eliminado.`;
            if (currentDate.value === date) {
                clearAllFields();
            }
        } catch (error) {
            message.value = `Error al eliminar: ${error.message}`;
        }
    }
};

// ---- COMPUTED PROPERTIES ----
const sortedReports = computed(() => {
  return Object.keys(dailyReports.value).sort((a, b) => b.localeCompare(a));
});

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

      <!-- Selector de Zona -->
      <div class="mb-6">
        <div class="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            v-for="zone in zones"
            :key="zone"
            @click="selectedZone = zone"
            :class="[
              'px-5 py-2 rounded-full font-medium transition-all duration-200 ease-in-out',
              selectedZone === zone
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            ]"
          >
            {{ zone }}
          </button>
        </div>
      </div>

      <!-- Contenedor del Formulario de Zona -->
      <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
        <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Reporte de la Zona: {{ selectedZone }}
        </h2>
        
        <!-- Formulario Muelles -->
        <div v-if="selectedZone === 'Muelles'">
            <!-- Aquí va el HTML del formulario de Muelles traducido de JSX -->
            <!-- Ejemplo: -->
            <label class="block text-gray-700 text-sm font-bold mb-2">Incidencias:</label>
            <textarea v-model="reportData.Muelles.incidencias" class="shadow appearance-none border rounded w-full py-2 px-3"></textarea>
            
            <span class="block text-gray-700 text-sm font-bold mt-4 mb-2">¿HA FALTADO ALGUIEN?</span>
            <div class="flex space-x-4">
                <button @click="muellesFaltaAlguien = 'si'" :class="{'bg-red-600 text-white': muellesFaltaAlguien === 'si', 'bg-gray-200': muellesFaltaAlguien !== 'si'}">SÍ</button>
                <button @click="muellesFaltaAlguien = 'no'" :class="{'bg-green-600 text-white': muellesFaltaAlguien === 'no', 'bg-gray-200': muellesFaltaAlguien !== 'no'}">NO</button>
            </div>
            <div v-if="muellesFaltaAlguien === 'si'" class="mt-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                <input type="text" v-model="muellesNombreFalta" class="shadow appearance-none border rounded w-full py-2 px-3" />
            </div>
        </div>

        <!-- Formulario ZBR (haz lo mismo para ZBR, ZAC, etc.) -->
        <div v-if="selectedZone === 'ZBR'">
            <!-- Contenido del formulario para ZBR -->
        </div>
        <div v-if="selectedZone === 'ZAC'">
            <!-- Contenido del formulario para ZAC -->
        </div>
         <div v-if="selectedZone === 'Empaquetado'">
            <!-- Contenido del formulario para Empaquetado -->
        </div>
         <div v-if="selectedZone === 'Maquinistas'">
            <!-- Contenido del formulario para Maquinistas -->
        </div>
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

      <!-- Mensajes al usuario -->
      <div v-if="message" class="mt-4 p-3 rounded-lg text-center font-semibold" :class="message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
        {{ message }}
      </div>

      <!-- Lista de Reportes Anteriores -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">Reportes Anteriores</h2>
        <div v-if="sortedReports.length === 0" class="text-center text-gray-600">
            No hay reportes guardados aún.
        </div>
        <div v-else class="space-y-4">
            <div v-for="date in sortedReports" :key="date" class="bg-white p-4 rounded-lg shadow-sm border">
                <h3 class="text-lg font-semibold">{{ date }}</h3>
                <button @click="currentDate = date">Ver/Editar</button>
                <button @click="handleDeleteClick(date)" class="text-red-500 ml-4">Eliminar</button>
            </div>
        </div>
      </div>

    </div>
  </div>
</template>
