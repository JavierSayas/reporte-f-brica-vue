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

// Este objeto contendrá los datos del formulario actual. Inicializamos las zonas para evitar errores.
const reportData = ref({
  Muelles: {},
  ZBR: {},
  ZAC: {},
  Empaquetado: {},
  Maquinistas: {}
});

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
const updateFormState = (newReportData) => {
  const report = newReportData || {};
  
  // Asegurarnos de que el objeto base existe para evitar errores de 'undefined'
  reportData.value = {
    Muelles: report.Muelles || {},
    ZBR: report.ZBR || {},
    ZAC: report.ZAC || {},
    Empaquetado: report.Empaquetado || {},
    Maquinistas: report.Maquinistas || {}
  };

  // Muelles
  muellesFaltaAlguien.value = report.Muelles?.falta_alguien ?? null;
  muellesNombreFalta.value = report.Muelles?.nombre_falta ?? '';

  // ZBR
  zbrMateriaPrimaEstado.value = report.ZBR?.materia_prima_estado ?? null;
  zbrMateriaPrimaDetalles.value = report.ZBR?.materia_prima_detalles ?? '';
  
  // ZAC
  zacHaHabidoIncidenciasPersonal.value = report.ZAC?.ha_habido_incidencias_personal ?? null;
  zacPersonalIncidents.value = report.ZAC?.personal_incidents?.length > 0 ? report.ZAC.personal_incidents : [];
  if (zacHaHabidoIncidenciasPersonal.value === 'si' && zacPersonalIncidents.value.length === 0) {
    zacPersonalIncidents.value.push({ name: '', type: null });
  }
  zacEstadoFruta.value = report.ZAC?.estado_fruta_estado ?? null;
  zacFrutaDetalles.value = report.ZAC?.fruta_detalles ?? '';
};

// Observa cuando cambia la fecha y actualiza el formulario
watch(currentDate, (newDate) => {
  updateFormState(dailyReports.value[newDate]);
}, { immediate: true });

// Observa cuando los reportes de Firebase se actualizan
watch(dailyReports, (newReports) => {
  updateFormState(newReports[currentDate.value]);
}, { deep: true, immediate: true });


const clearAllFields = () => {
  updateFormState({}); // Simplemente resetea el formulario con un objeto vacío
};

const handleAddZacIncident = () => {
    zacPersonalIncidents.value.push({ name: '', type: null });
};

// ---- MANEJADORES DE EVENTOS ----
const handleSubmitReport = async () => {
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
          personal_incidents: zacHaHabidoIncidenciasPersonal.value === 'si' ? zacPersonalIncidents.value.filter(inc => inc.name && inc.name.trim() !== '') : [],
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
        setMessage('No hay reporte para la fecha seleccionada para generar.');
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
const sortedReportDates = computed(() => {
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
        
        <!-- FORMULARIO MUELLES -->
        <div v-if="selectedZone === 'Muelles'">
          <label class="block text-gray-700 text-sm font-bold mb-2">Incidencias:</label>
          <textarea v-model="reportData.Muelles.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
          
          <div class="mt-4">
            <span class="block text-gray-700 text-sm font-bold mb-2">¿HA FALTADO ALGUIEN?</span>
            <div class="flex space-x-4">
              <button @click="muellesFaltaAlguien = 'si'" :class="['px-4 py-2 rounded-lg font-medium', muellesFaltaAlguien === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
              <button @click="muellesFaltaAlguien = 'no'" :class="['px-4 py-2 rounded-lg font-medium', muellesFaltaAlguien === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
            </div>
          </div>

          <div v-if="muellesFaltaAlguien === 'si'" class="mt-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Nombre de la persona que ha faltado:</label>
            <input type="text" v-model="muellesNombreFalta" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
          </div>
        </div>

        <!-- FORMULARIO ZBR -->
        <div v-if="selectedZone === 'ZBR'">
            <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZBR:</label>
            <input type="text" v-model="reportData.ZBR.coordinador_zbr" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            
            <div class="mt-4">
                <span class="block text-gray-700 text-sm font-bold mb-2">MATERIA PRIMA:</span>
                <div class="flex space-x-4">
                    <button @click="zbrMateriaPrimaEstado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', zbrMateriaPrimaEstado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
                    <button @click="zbrMateriaPrimaEstado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', zbrMateriaPrimaEstado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
                </div>
            </div>

            <div v-if="zbrMateriaPrimaEstado === 'mal_estado'" class="mt-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado:</label>
                <textarea v-model="zbrMateriaPrimaDetalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
            <textarea v-model="reportData.ZBR.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
        </div>

        <!-- FORMULARIO ZAC -->
        <div v-if="selectedZone === 'ZAC'">
            <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZAC:</label>
            <input type="text" v-model="reportData.ZAC.coordinador_zac" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />

            <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias en máquinas:</label>
            <textarea v-model="reportData.ZAC.incidencias_maquinas" rows="5" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>

            <div class="mt-4">
                <span class="block text-gray-700 text-sm font-bold mb-2">¿HA HABIDO INCIDENCIAS CON EL PERSONAL?</span>
                <div class="flex space-x-4">
                    <button @click="zacHaHabidoIncidenciasPersonal = 'si'" :class="['px-4 py-2 rounded-lg font-medium', zacHaHabidoIncidenciasPersonal === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
                    <button @click="zacHaHabidoIncidenciasPersonal = 'no'" :class="['px-4 py-2 rounded-lg font-medium', zacHaHabidoIncidenciasPersonal === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
                </div>
            </div>

            <div v-if="zacHaHabidoIncidenciasPersonal === 'si'" class="space-y-3 mt-4">
                <div v-for="(incident, index) in zacPersonalIncidents" :key="index" class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input type="text" placeholder="Nombre de la persona" v-model="incident.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 flex-grow" />
                    <div class="flex space-x-2 mt-2 sm:mt-0">
                        <button @click="incident.type = 'llega_tarde'" :class="['px-3 py-1 rounded-lg text-xs font-medium', incident.type === 'llega_tarde' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-800']">LLEGA TARDE</button>
                        <button @click="incident.type = 'no_ha_venido'" :class="['px-3 py-1 rounded-lg text-xs font-medium', incident.type === 'no_ha_venido' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">NO HA VENIDO</button>
                    </div>
                </div>
                 <button @click="handleAddZacIncident" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2">+ Añadir otra persona</button>
            </div>

            <div class="mt-4">
                <span class="block text-gray-700 text-sm font-bold mb-2">ESTADO DE LA FRUTA:</span>
                <div class="flex space-x-4">
                    <button @click="zacEstadoFruta = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', zacEstadoFruta === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
                    <button @click="zacEstadoFruta = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', zacEstadoFruta === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
                </div>
            </div>

            <div v-if="zacEstadoFruta === 'mal_estado'" class="mt-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado de la fruta:</label>
                <textarea v-model="zacFrutaDetalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
            </div>
        </div>

        <!-- FORMULARIO EMPAQUETADO -->
        <div v-if="selectedZone === 'Empaquetado'">
            <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR:</label>
            <input type="text" v-model="reportData.Empaquetado.coordinador" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
            <textarea v-model="reportData.Empaquetado.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
        </div>

        <!-- FORMULARIO MAQUINISTAS -->
        <div v-if="selectedZone === 'Maquinistas'">
            <label class="block text-gray-700 text-sm font-bold mb-2">MAQUINISTA:</label>
            <input type="text" v-model="reportData.Maquinistas.maquinista" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
            <textarea v-model="reportData.Maquinistas.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
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

      <!-- Modal de Reporte de Texto -->
      <div v-if="showTextReportModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-indigo-700 mb-4">Reporte de Texto Diario</h2>
          <textarea class="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm" rows="15" readonly :value="textReportContent"></textarea>
          <div class="flex justify-end space-x-4 mt-4">
            <button @click="copyToClipboard" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
              Copiar al Portapapeles
            </button>
            <button @click="showTextReportModal = false" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de Reportes Anteriores -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">Reportes Anteriores</h2>
        <div v-if="sortedReportDates.length === 0" class="text-center text-gray-600">
            No hay reportes guardados aún.
        </div>
        <div v-else class="space-y-4">
            <div v-for="date in sortedReportDates" :key="date" class="bg-white p-4 rounded-lg shadow-sm border">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800">Reporte del {{ date }}</h3>
                    <div>
                        <button @click="currentDate = date" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded-md border border-indigo-200 hover:bg-indigo-50">Ver/Editar</button>
                        <button @click="handleDeleteClick(date)" class="text-sm bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1 rounded-md ml-2">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
