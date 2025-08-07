<script setup>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Variables reactivas para los campos del formulario y los mensajes
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// Función que se ejecuta al enviar el formulario
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  const auth = getAuth();
  
  try {
    // Intentamos iniciar sesión con Firebase usando el email y la contraseña
    await signInWithEmailAndPassword(auth, email.value, password.value);
    // Si tiene éxito, no necesitamos hacer nada.
    // El listener onAuthStateChanged en useFirebase.js se encargará de todo.
  } catch (error) {
    // Si falla, mostramos un mensaje de error claro al usuario
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
        console.error("Error de Firebase:", error); // Muestra el error completo en la consola para depuración
        break;
    }
  } finally {
    // Se ejecuta siempre, tanto si hay éxito como si hay error
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
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
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
