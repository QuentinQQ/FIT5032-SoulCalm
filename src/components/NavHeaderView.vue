<template>
  <header class="navbar navbar-expand-md navbar-light bg-light nav-header">
    <!-- logo -->
    <b-navbar-brand href="/" class="logo">
      <img src="@/assets/logo.png" alt="SoulCalm Logo" width="50" height="50" />
    </b-navbar-brand>

    <!-- Navbar toggler for mobile screens -->
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navigation items -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav mx-auto">
        <li class="nav-item">
          <router-link to="/" class="nav-link">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/learn" class="nav-link">Learn</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/news-and-events" class="nav-link">News</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/community" class="nav-link">Community</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/help" class="nav-link">Help</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/involved" class="nav-link">Involved</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link">About</router-link>
        </li>
        <li v-if="isAdmin" class="nav-item">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        </li>
      </ul>

      <!-- Login/Register or User Avatar -->
      <div class="d-flex align-items-center">
        <div v-if="isAuthenticated" class="dropdown">
          <div
            id="userMenu"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style="cursor: pointer"
          >
            <i class="bi bi-person-circle user-icon"></i>
          </div>
          <!-- Dropdown Menu -->
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
            <li>
              <button class="dropdown-item" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
        <div v-else>
          <button @click="navigateTo('/login')" class="btn btn-outline-primary me-2">Login</button>
          <button @click="navigateTo('/register')" class="btn btn-primary">Register</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import router from '../router'
import { useAuth } from '@/firebase/authenticate'
import { computed } from 'vue'

// const router = useRouter()
const { isAuthenticated, logout, currentRole } = useAuth()
const navigateTo = (path) => {
  router.push(path)
}
const isAdmin = computed(() => isAuthenticated.value && currentRole.value === 'admin')

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Learn', path: '/learn' },
  { name: 'News', path: '/news-and-events' },
  { name: 'Community', path: '/community' },
  { name: 'Help', path: '/help' },
  { name: 'Involved', path: '/involved' },
  { name: 'About', path: '/about' }
]
</script>

<style scoped>
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.user-icon {
  font-size: 32px;
  color: #275fda;
}

.logo {
  position: relative;
  left: 40px;
}

.nav-link {
  color: black;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  z-index: 1050;
}

.nav-link:hover {
  background-color: #275fda;
  color: white;
  border-radius: 5px;
}

.btn-outline-primary {
  color: #275fda;
  border-color: #275fda;
}

.btn-outline-primary:hover {
  background-color: #275fda;
  color: white;
}

.btn-primary {
  background-color: #275fda;
  border-color: #275fda;
}

.btn-primary:hover {
  background-color: #004085;
  border-color: #003766;
}
</style>
