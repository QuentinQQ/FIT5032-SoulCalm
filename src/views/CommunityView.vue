<template>
  <div class="container">
    <!-- Loged in -->
    <div v-if="isAuthenticated" class="c-authenticated">
      <div>
        <h1 class="text-center">Community</h1>
        <p class="text-center mb-3">Welcome to the community page!</p>
      </div>
    </div>
    <!-- Not login -->
    <div v-else class="c-not-authenticated">
      <div>
        <h1 class="text-center">Access Denied</h1>
        <p class="text-center">
          You do not have permission to view this page. Please log in first.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/router/authenticate'

const { isAuthenticated } = useAuth()
</script>
