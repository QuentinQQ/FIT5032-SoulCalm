<template>
  <div class="container">
    <div>
      <!-- user not log in -->
      <div v-if="!isAuthenticated">
        <h1 class="text-center">Access Denied</h1>
        <p class="text-center">
          You do not have permission to view this page. Please log in first.
        </p>
      </div>
      <!-- user logged in -->
      <div v-else-if="currentRole == 'user'">
        <h1 class="text-center">Access Denied</h1>
        <p class="text-center">You do not have permission to view this page.</p>
      </div>
      <!-- admin logged in -->
      <div v-else-if="currentRole == 'admin'">
        <h1 class="text-center">Community</h1>
        <p class="text-center">Welcome to the community page!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/firebase/authenticate'

const { isAuthenticated, currentRole } = useAuth()
</script>
