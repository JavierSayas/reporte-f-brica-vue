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

const selectYesForIncidents = () => {
  formData.value.ha_habido_incidencias_personal = 'si';
  if (!formData.value.personal_incidents || formData.value.personal_incidents.length === 0) {
    formData.value.personal_incidents = [{ name: '', type: null }];
  }
};

const onIncidentNameInput = (incident, index) => {
  if (incident.name.trim() !== '' && index === formData.value.personal_incidents.length - 1) {
    formData.value.personal_incidents.push({ name: '', type: null });
  }
};

const onIncidentNameBlur = (incident, index) => {
  if (incident.name.trim() === '' && index < formData.value.personal_incidents.length - 1) {
    formData.value.personal_incidents.splice(index, 1);
  }
};
</script>

<template>
  <div v-if="formData">
    <label class="block text-gray-700 text-sm font-bold mb-2">COORDINADOR ZAC:</label>
    <input type="text" v-model="formData.coordinador_zac" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />

    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias en máquinas:</label>
    <textarea v-model="formData.incidencias_maquinas" rows="5" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>

    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">¿HA HABIDO INCIDENCIAS CON EL PERSONAL?</span>
      <div class="flex space-x-4">
        <button @click="selectYesForIncidents" :class="['px-4 py-2 rounded-lg font-medium', formData.ha_habido_incidencias_personal === 'si' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">SÍ</button>
        <button @click="formData.ha_habido_incidencias_personal = 'no'" :class="['px-4 py-2 rounded-lg font-medium', formData.ha_habido_incidencias_personal === 'no' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">NO</button>
      </div>
    </div>

    <div v-if="formData.ha_habido_incidencias_personal === 'si'" class="space-y-3 mt-4">
      <div v-for="(incident, index) in formData.personal_incidents" :key="index" class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
    </div>

    <div class="mt-4">
      <span class="block text-gray-700 text-sm font-bold mb-2">ESTADO DE LA FRUTA:</span>
      <div class="flex flex-wrap gap-2">
        <button @click="formData.estado_fruta_estado = 'buen_estado'" :class="['px-4 py-2 rounded-lg font-medium', formData.estado_fruta_estado === 'buen_estado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800']">BUEN ESTADO</button>
        <button @click="formData.estado_fruta_estado = 'regular'" :class="['px-4 py-2 rounded-lg font-medium', formData.estado_fruta_estado === 'regular' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800']">REGULAR</button>
        <button @click="formData.estado_fruta_estado = 'mal_estado'" :class="['px-4 py-2 rounded-lg font-medium', formData.estado_fruta_estado === 'mal_estado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800']">MAL ESTADO</button>
      </div>
    </div>

    <div v-if="formData.estado_fruta_estado === 'regular'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Observaciones sobre el estado regular de la fruta:</label>
      <textarea v-model="formData.fruta_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>
    
    <div v-if="formData.estado_fruta_estado === 'mal_estado'" class="mt-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Más datos sobre el mal estado de la fruta:</label>
      <textarea v-model="formData.fruta_detalles" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
    </div>
  </div>
</template>
