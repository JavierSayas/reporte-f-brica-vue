<script setup>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Variables reactivas para el formulario
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// --- NUEVA VARIABLE DE ESTADO ---
// Para controlar si la contraseña es visible. Por defecto, está oculta (false).
const isPasswordVisible = ref(false);

// Función que se ejecuta al enviar el formulario
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  const auth = getAuth();
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    // onAuthStateChanged en useFirebase.js se encargará del resto
  } catch (error) {
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage.value = 'El formato del correo electrónico no es válido.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage.value = 'Correo electrónico o contraseña incorrectos.';
        break;
      default:
        errorMessage.value = 'Ha ocurrido un error inesperado al intentar iniciar sesión.';
        console.error("Error de Firebase:", error);
        break;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-extrabold text-center text-indigo-800 mb-6">
        Iniciar Sesión
      </h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        
        <!-- --- CONTENEDOR DE LA CONTRASEÑA MODIFICADO --- -->
        <div class="mb-6 relative">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
          <input
            <!-- El 'type' ahora es dinámico: 'text' si es visible, 'password' si no -->
            :type="isPasswordVisible ? 'text' : 'password'"
            id="password"
            v-model="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 pr-10"
          />
          <!-- NUEVO BOTÓN PARA MOSTRAR/OCULTAR -->
          <button 
            type="button" 
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
            aria-label="Mostrar u ocultar contraseña"
          >
            <!-- Usamos un icono SVG de "ojo" que cambia -->
            <svg v-if="!isPasswordVisible" class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.955 9.955 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2 2 0 012.828 2.828l1.515 1.515a4 4 0 00-5.858-5.858zM10 13a3 3 0 01-3-3l7.929-7.929A10.051 10.051 0 0119.542 10c-1.274 4.057-5.022 7-9.542 7a9.955 9.955 0 01-4.512-1.074l1.78-1.781A3 3 0 0110 13z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="flex items-center justify-between">
          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300"
          >
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
        <p v-if="errorMessage" class="text-red-500 text-xs italic mt-4 text-center">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>
