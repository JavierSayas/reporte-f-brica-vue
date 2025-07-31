<script setup>
import { computed } from 'vue';

const props = defineProps({
  reports: Object
});
const emit = defineEmits(['select-date', 'delete-report']);

const sortedReportDates = computed(() => {
  if (!props.reports) return [];
  return Object.keys(props.reports).sort((a, b) => b.localeCompare(a));
});
</script>

<template>
  <div class="mt-8 pt-6 border-t border-gray-200">
    <h2 class="text-2xl font-bold text-indigo-700 mb-4 text-center">Reportes Anteriores</h2>
    <div v-if="sortedReportDates.length === 0" class="text-center text-gray-600">
      No hay reportes guardados aún.
    </div>
    <div v-else class="space-y-4">
      <div v-for="date in sortedReportDates" :key="date" class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-800">Reporte del {{ date }}</h3>
          <div>
            <button @click="emit('select-date', date)" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded-md border border-indigo-200 hover:bg-indigo-50">Ver/Editar</button>
            <button @click="emit('delete-report', date)" class="text-sm bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1 rounded-md ml-2">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
