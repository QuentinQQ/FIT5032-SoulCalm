<template>
  <div class="container">
    <access-denied-view />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/firebase/authenticate'
import AccessDeniedView from './AccessDeniedView.vue'

const { isAuthenticated } = useAuth()
</script>
