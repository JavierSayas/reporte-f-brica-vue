<script setup>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const isPasswordVisible = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  const auth = getAuth();
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
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
        
        <div class="mb-6 relative">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            id="password"
            v-model="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 pr-10"
          />
          <button 
            type="button" 
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
            aria-label="Mostrar u ocultar contraseña"
          >
            <!-- SVG CORREGIDO - Ojo Abierto -->
            <svg v-if="!isPasswordVisible" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
            </svg>
            <!-- SVG CORREGIDO - Ojo Cerrado -->
            <svg v-else class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.666 1.32-3.142 2.288-4.334M6.75 6.75A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-2.036 3.875m-9.542 2.125a3 3 0 11-4.242-4.242" />
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
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
