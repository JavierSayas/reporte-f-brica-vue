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
    <label class="block text-gray-700 text-sm font-bold mb-2">MAQUINISTA:</label>
    <input type="text" v-model="formData.maquinista" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
    <textarea v-model="formData.incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
  </div>
</template>
