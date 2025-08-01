<script setup>
defineProps({
  zones: Array,
  modelValue: String
});
defineEmits(['update:modelValue']);

// NUEVO: Creamos un objeto que mapea cada zona a un color de Tailwind CSS
const zoneColors = {
  Muelles: 'bg-blue-600',
  ZBR: 'bg-green-600',
  ZAC: 'bg-red-600',
  Empaquetado: 'bg-amber-500',
  Maquinistas: 'bg-slate-600',
};
</script>

<template>
  <div class="mb-6">
    <div class="flex flex-wrap justify-center gap-2 sm:gap-4">
      <button
        v-for="zone in zones"
        :key="zone"
        @click="$emit('update:modelValue', zone)"
        
        <!-- MODIFICADO: La lógica de :class ahora usa el objeto zoneColors -->
        :class="[
          'px-5 py-2 rounded-full font-medium transition-all duration-200 ease-in-out', // Estilos base para todos los botones
          
          // Condición para los estilos de botón ACTIVO
          modelValue === zone
            ? [zoneColors[zone], 'text-white', 'shadow-md', 'transform', 'scale-105'] 
            
          // Condición para los estilos de botón INACTIVO
            : ['bg-gray-200', 'text-gray-800', 'hover:bg-gray-300']
        ]"
      >
        {{ zone }}
      </button>
    </div>
  </div>
</template>
