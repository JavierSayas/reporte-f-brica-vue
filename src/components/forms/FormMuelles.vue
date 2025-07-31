<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);

// Usamos toRefs para que las propiedades sean reactivas y editables con v-model
const { incidencias, falta_alguien, nombre_falta } = toRefs(props.modelValue);
</script>

<template>
  <div>
    <label class="block text-gray-700 text-sm font-bold mb-2">Incidencias:</label>
    <textarea v-model="incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">¿HA FALTADO ALGUIEN?</span>
      <div class="flex space-x-4">
        <button @click="falta_alguien = 'si'" :class="['px-4 py-2 rounded-lg font-medium', falta_alguien === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
        <button @click="falta_alguien = 'no'" :class="['px-4 py-2 rounded-lg font-medium', falta_alguien === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
      </div>
    </div>

    <div v-if="falta_alguien === 'si'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Nombre de la persona que ha faltado:</label>
      <input type="text" v-model="nombre_falta" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    </div>
  </div>
</template>
