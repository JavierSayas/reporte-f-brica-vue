<script setup>
// Script simplificado, ya no usamos toRefs.
const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);
</script>

<template>
  <!-- Usamos v-if para asegurarnos de que modelValue existe antes de usarlo -->
  <div v-if="modelValue">
    <label class="block text-gray-700 text-sm font-bold mb-2">Incidencias:</label>
    <!-- Los v-model ahora apuntan a modelValue.propiedad -->
    <textarea v-model="modelValue.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">¿HA FALTADO ALGUIEN?</span>
      <div class="flex space-x-4">
        <!-- CORRECCIÓN: Los @click ahora modifican modelValue.falta_alguien -->
        <button @click="modelValue.falta_alguien = 'si'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.falta_alguien === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
        <button @click="modelValue.falta_alguien = 'no'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.falta_alguien === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
      </div>
    </div>

    <!-- La condición ahora también usa modelValue.falta_alguien -->
    <div v-if="modelValue.falta_alguien === 'si'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Nombre de la persona que ha faltado:</label>
      <input type="text" v-model="modelValue.nombre_falta" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    </div>
  </div>
</template>
