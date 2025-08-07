<script setup>
import { ref } from 'vue';

// El componente emitirá estos eventos para comunicarse con App.vue
const emit = defineEmits(['close', 'submit']);

// Variables reactivas para los campos del formulario
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleSubmit = () => {
  // Validación simple: las contraseñas nuevas deben coincidir
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Las nuevas contraseñas no coinciden.';
    return;
  }
  // Validación simple: la nueva contraseña no puede estar vacía
  if (newPassword.value.length < 6) {
    errorMessage.value = 'La nueva contraseña debe tener al menos 6 caracteres.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  // Emitimos el evento 'submit' con los datos para que App.vue maneje la lógica de Firebase
  emit('submit', {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });
};
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <h2 class="text-2xl font-bold text-indigo-700 mb-6 text-center">Cambiar Contraseña</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="current-password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña Actual:</label>
          <input
            type="password"
            id="current-password"
            v-model="currentPassword"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div class="mb-4">
          <label for="new-password" class="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña:</label>
          <input
            type="password"
            id="new-password"
            v-model="newPassword"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div class="mb-6">
          <label for="confirm-password" class="block text-gray-700 text-sm font-bold mb-2">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirm-password"
            v-model="confirmPassword"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            @click="$emit('close')"
            class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300"
          >
            {{ isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
          </button>
        </div>
        <p v-if="errorMessage" class="text-red-500 text-xs italic mt-4 text-center">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>
