<script setup>
import { ref, computed, watch } from 'vue';
import { useFirebase } from './composables/useFirebase.js';

// Importa TODOS los componentes, incluido el nuevo modal
import Login from './components/Login.vue';
import ZoneSelector from './components/ZoneSelector.vue';
import ReportList from './components/ReportList.vue';
import TextReportModal from './components/TextReportModal.vue';
import ChangePasswordModal from './components/ChangePasswordModal.vue'; // <-- NUEVO
import FormMuelles from './components/forms/FormMuelles.vue';
import FormZBR from './components/forms/FormZBR.vue';
import FormZAC from './components/forms/FormZAC.vue';
import FormEmpaquetado from './components/forms/FormEmpaquetado.vue';
import FormMaquinistas from './components/forms/FormMaquinistas.vue';

// Obtiene la nueva función 'changePassword' del composable
const { 
  loading, 
  dailyReports, 
  saveReport, 
  deleteReport, 
  userId, 
  userEmail, 
  logout,
  changePassword // <-- NUEVO
} = useFirebase();

// Estado para controlar la visibilidad del nuevo modal
const showChangePasswordModal = ref(false); // <-- NUEVO

// El resto del estado de la aplicación no cambia
const zones = ['Muelles', 'ZBR', 'ZAC', 'Empaquetado', 'Maquinistas'];
// ... (resto de variables de estado que ya tenías)
const selectedZone = ref('Muelles');
const currentDate = ref(new Date().toISOString().split('T')[0]);
const message = ref('');
const showTextReportModal = ref(false);
const textReportContent = ref('');
const whatsappReadyText = ref('');
const reportData = ref({});

// El watcher no cambia
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

// El resto de la lógica de componentes y funciones no cambia...
const formComponents = { Muelles: FormMuelles, ZBR: FormZBR, ZAC: FormZAC, Empaquetado: FormEmpaquetado, Maquinistas: FormMaquinistas };
const activeFormComponent = computed(() => formComponents[selectedZone.value]);
const generateSummaryText = (report) => { /* ... (código que ya tienes) ... */ return "texto..."; };
const handleSubmitReport = async () => { /* ... (código que ya tienes) ... */ };
const sendToWhatsApp = () => { /* ... (código que ya tienes) ... */ };
const handleDeleteReport = async (date) => { /* ... (código que ya tienes) ... */ };
const handleGenerateTextReport = () => { /* ... (código que ya tienes) ... */ };
const handleCopyReport = async () => { /* ... (código que ya tienes) ... */ };


// --- NUEVA FUNCIÓN PARA MANEJAR EL EVENTO DEL MODAL ---
const handleChangePassword = async (payload) => {
  try {
    await changePassword(payload.currentPassword, payload.newPassword);
    message.value = '¡Contraseña cambiada con éxito!';
    showChangePasswordModal.value = false; // Cierra el modal si todo va bien
    setTimeout(() => { message.value = ''; }, 3000);
  } catch (error) {
    let userMessage = 'Error al cambiar la contraseña.';
    if (error.code === 'auth/wrong-password') {
      userMessage = 'La contraseña actual es incorrecta.';
    }
    // Para mostrar el error en el propio modal, tendríamos que pasarlo como prop.
    // Por simplicidad, lo mostramos en el mensaje general de App.vue
    message.value = userMessage;
    console.error(error);
  }
};
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gray-100">Cargando...</div>
  
  <Login v-else-if="!userId" />

  <div v-else class="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
    <div class="bg-white shadow-lg rounded-xl w-full max-w-4xl border border-gray-200">
      
      <header class="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <p class="text-sm text-gray-600">
          <span class="hidden sm:inline">Conectado como:</span>
          <strong class="font-mono">{{ userEmail }}</strong>
        </p>
        <!-- AÑADIMOS EL BOTÓN DE CAMBIAR CONTRASEÑA -->
        <div class="flex items-center gap-2">
          <button @click="showChangePasswordModal = true" class="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors">
            Cambiar Contraseña
          </button>
          <button @click="logout" class="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main class="p-6">
        <!-- El resto del template es el mismo que ya tenías -->
        <h1 class="text-3xl font-extrabold text-center text-indigo-800 mb-6">Reporte Diario de Zonas de Fábrica</h1>
        <!-- ... (selector de fecha, zonas, formularios, etc.) ... -->
      </main>
    </div>

    <!-- AÑADIMOS EL NUEVO MODAL AQUÍ -->
    <ChangePasswordModal
      v-if="showChangePasswordModal"
      @close="showChangePasswordModal = false"
      @submit="handleChangePassword"
    />
  </div>
</template>
