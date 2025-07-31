<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);

const { coordinador_zbr, materia_prima_estado, materia_prima_detalles, incidencias } = toRefs(props.modelValue);
</script>

<template>
  <div>
    <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZBR:</label>
    <input type="text" v-model="coordinador_zbr" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">MATERIA PRIMA:</span>
      <div class="flex space-x-4">
        <button @click="materia_prima_estado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', materia_prima_estado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
        <button @click="materia_prima_estado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', materia_prima_estado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
      </div>
    </div>

    <div v-if="materia_prima_estado === 'mal_estado'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado:</label>
      <textarea v-model="materia_prima_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>

    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
    <textarea v-model="incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
  </div>
</template>
