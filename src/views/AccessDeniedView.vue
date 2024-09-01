<template>
  <div class="container">
    <div>
      <h1 class="text-center">Access Denied</h1>
      <!-- not log in -->
      <div v-if="!isAuthenticated">
        <p class="text-center">
          You do not have permission to view this page. Please log in first.
        </p>
      </div>
      <!-- logged in -->
      <div v-else-if="currentRole == 'user'">
        <p class="text-center">You do not have permission to view this page.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/firebase/authenticate'

const { isAuthenticated, currentRole } = useAuth()
</script>
