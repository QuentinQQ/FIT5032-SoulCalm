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
              <button class="dropdown-item" @click="showProfile">Profile</button>
            </li>
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
  <!-- Profile Overlay -->
    <div v-if="isProfileVisible" class="profile-overlay">
    <div class="profile-content">
      <h2>User Profile</h2>
      <p><strong>Email:</strong> {{ email }}</p>
      <p><strong>Role:</strong> {{ userRole }}</p>
      <button @click="closeProfile" class="btn btn-primary">Close</button>
    </div>
  </div>
  </header>
</template>

<script setup>
import router from '../router'
import { useAuth } from '@/firebase/authenticate'
import { ref, computed } from 'vue'
import { useDb } from '@/firebase/firestore'

// const router = useRouter()
const { isAuthenticated, logout, currentRole, currentUserUid } = useAuth()
const navigateTo = (path) => {
  router.push(path)
}
const isAdmin = computed(() => isAuthenticated.value && currentRole.value === 'admin')

const isProfileVisible = ref(false);
const username = ref('');
const email = ref('');
const userRole = ref('');

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Learn', path: '/learn' },
  { name: 'News', path: '/news-and-events' },
  { name: 'Community', path: '/community' },
  { name: 'Help', path: '/help' },
  { name: 'Involved', path: '/involved' },
  { name: 'About', path: '/about' }
]

const showProfile = async () => {
  try {
    const userInfo = await useDb.getUserInfo(currentUserUid.value);
    if (userInfo) {
      email.value = userInfo.email || 'N/A';
      userRole.value = currentRole.value || 'N/A';
      isProfileVisible.value = true;
    } else {
      console.error('User info not found');
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
};

const closeProfile = () => {
  isProfileVisible.value = false;
};
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

.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.profile-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}
</style>
