<script setup>
const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);

// Función que se ejecuta al pulsar "SÍ" en las incidencias de personal
const selectYesForIncidents = () => {
  props.modelValue.ha_habido_incidencias_personal = 'si';
  // Si no hay ninguna incidencia, añade la primera vacía para que aparezca
  if (!props.modelValue.personal_incidents || props.modelValue.personal_incidents.length === 0) {
    props.modelValue.personal_incidents = [{ name: '', type: null }];
  }
};

// Función que se ejecuta cada vez que el usuario escribe en un campo de nombre
const onIncidentNameInput = (incident, index) => {
  // Condición: Si se está escribiendo en el último campo Y ese campo ya no está vacío...
  if (incident.name.trim() !== '' && index === props.modelValue.personal_incidents.length - 1) {
    // ...añade un nuevo campo vacío al final de la lista.
    props.modelValue.personal_incidents.push({ name: '', type: null });
  }
};

// (Opcional pero recomendado) Función que limpia campos vacíos intermedios
const onIncidentNameBlur = (incident, index) => {
  // Condición: Si el campo ha quedado vacío Y no es el último de la lista...
  if (incident.name.trim() === '' && index < props.modelValue.personal_incidents.length - 1) {
    // ...elimínalo para mantener la lista limpia.
    props.modelValue.personal_incidents.splice(index, 1);
  }
};
</script>

<template>
  <div v-if="modelValue">
    <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZAC:</label>
    <input type="text" v-model="modelValue.coordinador_zac" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />

    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias en máquinas:</label>
    <textarea v-model="modelValue.incidencias_maquinas" rows="5" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>

    <!-- Incidencias de Personal -->
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">¿HA HABIDO INCIDENCIAS CON EL PERSONAL?</span>
      <div class="flex space-x-4">
        <!-- MODIFICADO: El botón "SÍ" ahora llama a nuestra función -->
        <button @click="selectYesForIncidents" :class="['px-4 py-2 rounded-lg font-medium', modelValue.ha_habido_incidencias_personal === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
        <button @click="modelValue.ha_habido_incidencias_personal = 'no'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.ha_habido_incidencias_personal === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
      </div>
    </div>

    <div v-if="modelValue.ha_habido_incidencias_personal === 'si'" class="space-y-3 mt-4">
      <!-- MODIFICADO: El v-for ahora tiene los nuevos eventos @input y @blur -->
      <div v-for="(incident, index) in modelValue.personal_incidents" :key="index" class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input 
          type="text" 
          placeholder="Nombre de la persona" 
          v-model="incident.name"
          @input="onIncidentNameInput(incident, index)"
          @blur="onIncidentNameBlur(incident, index)"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 flex-grow" 
        />
        <div class="flex space-x-2 mt-2 sm:mt-0">
          <button @click="incident.type = 'llega_tarde'" :class="['px-3 py-1 rounded-lg text-xs font-medium', incident.type === 'llega_tarde' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-800']">LLEGA TARDE</button>
          <button @click="incident.type = 'no_ha_venido'" :class="['px-3 py-1 rounded-lg text-xs font-medium', incident.type === 'no_ha_venido' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">NO HA VENIDO</button>
        </div>
      </div>
      <!-- ELIMINADO: Ya no necesitamos el botón "+ Añadir otra persona" -->
    </div>

    <!-- ESTADO DE LA FRUTA (con la nueva opción REGULAR) -->
    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">ESTADO DE LA FRUTA:</span>
      <div class="flex flex-wrap gap-2">
        <button @click="modelValue.estado_fruta_estado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.estado_fruta_estado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
        <button @click="modelValue.estado_fruta_estado = 'regular'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.estado_fruta_estado === 'regular' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800']">REGULAR</button>
        <button @click="modelValue.estado_fruta_estado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', modelValue.estado_fruta_estado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
      </div>
    </div>

    <div v-if="modelValue.estado_fruta_estado === 'regular'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Observaciones sobre el estado regular de la fruta:</label>
      <textarea v-model="modelValue.fruta_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>
    
    <div v-if="modelValue.estado_fruta_estado === 'mal_estado'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado de la fruta:</label>
      <textarea v-model="modelValue.fruta_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>
  </div>
</template>
