<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(['update:modelValue']);

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div v-if="formData">
    <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZBR:</label>
    <input type="text" v-model="formData.coordinador_zbr" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">MATERIA PRIMA:</span>
      <div class="flex flex-wrap gap-2">
        <button @click="formData.materia_prima_estado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', formData.materia_prima_estado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
        <button @click="formData.materia_prima_estado = 'regular'" :class="['px-4 py-2 rounded-lg font-medium', formData.materia_prima_estado === 'regular' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800']">REGULAR</button>
        <button @click="formData.materia_prima_estado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', formData.materia_prima_estado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
      </div>
    </div>

    <div v-if="formData.materia_prima_estado === 'mal_estado'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado:</label>
      <textarea v-model="formData.materia_prima_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>

    <div v-if="formData.materia_prima_estado === 'regular'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Observaciones sobre el estado regular:</label>
      <textarea v-model="formData.materia_prima_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>

    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
    <textarea v-model="formData.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
  </div>
</template>
