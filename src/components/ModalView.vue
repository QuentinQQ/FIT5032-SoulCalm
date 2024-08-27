<template>
  <div class="modal-view">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">X</button>
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LoginView from '@/views/authentication/LoginView.vue'
import RegisterView from '@/views/authentication/RegisterView.vue'

const props = defineProps({
  modalType: String
})

const emit = defineEmits(['close'])

const currentComponent = computed(() => {
  return props.modalType === 'login' ? LoginView : RegisterView
})

function closeModal() {
  emit('close')
}
</script>

<style scoped>
.modal-view {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
