<script setup>
defineProps({
  content: String
});
const emit = defineEmits(['close', 'copy']);
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold text-indigo-700 mb-4">Reporte de Texto Diario</h2>
      <textarea class="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm" rows="15" readonly :value="content"></textarea>
      <div class="flex justify-end space-x-4 mt-4">
        <button @click="emit('copy')" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
          Copiar al Portapapeles
        </button>
        <button @click="emit('close')" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
