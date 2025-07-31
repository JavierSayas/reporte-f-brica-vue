<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  modelValue: Object,
});
defineEmits(['update:modelValue']);

const { maquinista, incidencias } = toRefs(props.modelValue);
</script>

<template>
  <div>
    <label class="block text-gray-700 text-sm font-bold mb-2">MAQUINISTA:</label>
    <input type="text" v-model="maquinista" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
    <label class="block text-gray-700 text-sm font-bold mb-2 mt-4">Incidencias:</label>
    <textarea v-model="incidencias" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
  </div>
</template>
