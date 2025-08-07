<script setup>
import { ref, computed, watch } from 'vue';
import { useFirebase } from './composables/useFirebase.js';
import Login from './components/Login.vue'; // <-- Importa el nuevo componente

// El resto de componentes
import ZoneSelector from './components/ZoneSelector.vue';
// ... (resto de imports)

// Ahora tenemos login y logout desde el composable
const { loading, dailyReports, saveReport, deleteReport, userId, userEmail, login, logout } = useFirebase();

// --- El resto del script es muy parecido, pero con lógica de login/logout ---
const zones = ['Muelles', 'ZBR', 'ZAC', 'Empaquetado', 'Maquinistas'];
// ... (resto de variables de estado)

// --- AÑADIMOS LÓGICA DE LOGIN AL COMPONENTE LOGIN ---
const handleLoginInComponent = async (email, password) => {
  try {
    await login(email, password);
  } catch (error) {
    // Si necesitas mostrar un error en la pantalla de login, aquí lo manejarías
    console.error("Error de login:", error.message);
  }
};

</script>

<template>
  <!-- Si está cargando, muestra el mensaje de carga -->
  <div v-if="loading" class="flex items-center justify-center min-h-screen">Cargando...</div>
  
  <!-- Si NO está cargando Y NO hay un usuario (userId es nulo), muestra el componente de Login -->
  <Login v-else-if="!userId" @login-success="credentials => handleLoginInComponent(credentials.email, credentials.password)" />

  <!-- Si NO está cargando Y SÍ hay un usuario, muestra la aplicación principal -->
  <div v-else class="min-h-screen bg-gray-100 p-4 font-sans">
    <!-- NUEVO: Cabecera con email y botón de logout -->
    <header class="max-w-4xl mx-auto mb-4 flex justify-between items-center">
      <p class="text-sm text-gray-600">Conectado como: <strong class="font-mono">{{ userEmail }}</strong></p>
      <button @click="logout" class="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg">
        Cerrar Sesión
      </button>
    </header>

    <!-- Aquí va el resto de tu aplicación que ya tenías -->
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl mx-auto border">
      <!-- ... (toda la estructura de H1, selector de fecha, formularios, etc.) ... -->
    </div>
  </div>
</template>
