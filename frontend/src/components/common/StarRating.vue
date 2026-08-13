<template>
  <span class="star-rating d-inline-flex align-items-center gap-1">
    <i
      v-for="n in 5"
      :key="n"
      :class="[
        n <= current ? 'fa-solid text-warning' : 'fa-regular text-muted',
        'fa-star',
        sizeClass,
        readonly ? '' : 'star-clickable'
      ]"
      @click="!readonly && $emit('update:modelValue', n)"
    ></i>
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  size: { type: String, default: "md" }, // md | sm
});

defineEmits(["update:modelValue"]);

const current = computed(() => Math.round(props.modelValue || 0));
const sizeClass = computed(() => (props.size === "sm" ? "fs-8" : ""));
</script>

<style scoped>
.star-clickable {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.star-clickable:hover {
  transform: scale(1.2);
}
</style>
