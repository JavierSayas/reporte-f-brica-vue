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
    <label class="block text-gray-700 text-sm font-bold mb-2">Incidencias:</label>
    <textarea v-model="formData.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">¿HA FALTADO ALGUIEN?</span>
      <div class="flex space-x-4">
        <button @click="formData.falta_alguien = 'si'" :class="['px-4 py-2 rounded-lg font-medium', formData.falta_alguien === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
        <button @click="formData.falta_alguien = 'no'" :class="['px-4 py-2 rounded-lg font-medium', formData.falta_alguien === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
      </div>
    </div>

    <div v-if="formData.falta_alguien === 'si'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Nombre de la persona que ha faltado:</label>
      <input type="text" v-model="formData.nombre_falta" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    </div>
  </div>
</template>
