<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);

const { 
  coordinador_zac, 
  incidencias_maquinas, 
  ha_habido_incidencias_personal, 
  personal_incidents, 
  estado_fruta_estado, 
  fruta_detalles 
} = toRefs(props.modelValue);

const handleAddIncident = () => {
  if (!personal_incidents.value) {
    personal_incidents.value = [];
  }
  personal_incidents.value.push({ name: '', type: null });
};
</script>

<template>
  <div>
    <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZAC:</label>
    <input type="text" v-model="coordinador_zac" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />

    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias en máquinas:</label>
    <textarea v-model="incidencias_maquinas" rows="5" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>

    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">¿HA HABIDO INCIDENCIAS CON EL PERSONAL?</span>
      <div class="flex space-x-4">
        <button @click="ha_habido_incidencias_personal = 'si'" :class="['px-4 py-2 rounded-lg font-medium', ha_habido_incidencias_personal === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
        <button @click="ha_habido_incidencias_personal = 'no'" :class="['px-4 py-2 rounded-lg font-medium', ha_habido_incidencias_personal === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
      </div>
    </div>

    <div v-if="ha_habido_incidencias_personal === 'si'" class="space-y-3 mt-4">
      <div v-for="(incident, index) in personal_incidents" :key="index" class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input type="text" placeholder="Nombre de la persona" v-model="incident.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 flex-grow" />
        <div class="flex space-x-2 mt-2 sm:mt-0">
          <button @click="incident.type = 'llega_tarde'" :class="['px-3 py-1 rounded-lg text-xs font-medium', incident.type === 'llega_tarde' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-800']">LLEGA TARDE</button>
          <button @click="incident.type = 'no_ha_venido'" :class="['px-3 py-1 rounded-lg text-xs font-medium', incident.type === 'no_ha_venido' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">NO HA VENIDO</button>
        </div>
      </div>
      <button @click="handleAddIncident" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2">+ Añadir otra persona</button>
    </div>

    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">ESTADO DE LA FRUTA:</span>
      <div class="flex space-x-4">
        <button @click="estado_fruta_estado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', estado_fruta_estado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
        <button @click="estado_fruta_estado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', estado_fruta_estado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
      </div>
    </div>

    <div v-if="estado_fruta_estado === 'mal_estado'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado de la fruta:</label>
      <textarea v-model="fruta_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>
  </div>
</template>
