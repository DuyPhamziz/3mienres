<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="base-modal-backdrop d-flex align-items-center justify-content-center"
        @click.self="close"
      >
        <div class="base-modal-dialog" :class="`base-modal-${size}`" role="dialog" aria-modal="true">
          <div class="base-modal-content bg-white rounded-5 shadow-lg">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  size: { type: String, default: "md" }, // sm | md | lg | xl
});

const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

const onKeydown = (e) => {
  if (e.key === "Escape") close();
};

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
.base-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1080;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
  padding: 1rem;
  overflow-y: auto;
}
.base-modal-dialog {
  width: 100%;
  margin: auto;
}
.base-modal-sm { max-width: 420px; }
.base-modal-md { max-width: 560px; }
.base-modal-lg { max-width: 800px; }
.base-modal-xl { max-width: 1100px; }
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .base-modal-dialog,
.modal-leave-active .base-modal-dialog {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .base-modal-dialog,
.modal-leave-to .base-modal-dialog {
  transform: scale(0.96);
}
</style>
