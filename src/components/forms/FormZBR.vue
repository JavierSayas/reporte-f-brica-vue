<script setup>
// El script ahora es mucho más simple. Solo necesitamos definir los props y emits.
// NO usamos toRefs. Dejamos que v-model haga todo el trabajo.
const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);
</script>

<template>
  <!-- Usamos un div contenedor y v-if para asegurarnos de que modelValue existe antes de intentar usarlo -->
  <div v-if="modelValue">
    <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZBR:</label>
    <!-- Modificamos directamente modelValue.coordinador_zbr -->
    <input type="text" v-model="modelValue.coordinador_zbr" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">MATERIA PRIMA:</span>
      <div class="flex flex-wrap gap-2">
        <!-- CORRECCIÓN: Ahora el @click modifica modelValue.materia_prima_estado -->
        <button @click="modelValue.materia_prima_estado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.materia_prima_estado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
        
        <button @click="modelValue.materia_prima_estado = 'regular'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.materia_prima_estado === 'regular' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800']">REGULAR</button>
        
        <button @click="modelValue.materia_prima_estado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.materia_prima_estado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
      </div>
    </div>

    <!-- Las condiciones ahora también usan modelValue.materia_prima_estado -->
    <div v-if="modelValue.materia_prima_estado === 'mal_estado'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado:</label>
      <textarea v-model="modelValue.materia_prima_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>

    <div v-if="modelValue.materia_prima_estado === 'regular'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Observaciones sobre el estado regular:</label>
      <textarea v-model="modelValue.materia_prima_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>

    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
    <textarea v-model="modelValue.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
  </div>
</template>
