<template>
  <div class="container">
    <header
      class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom nav-header"
    >
      <!-- logo -->
      <b-navbar-brand
        href="/"
        class="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none logo"
      >
        <img src="@/assets/logo.png" alt="SoulCalm Logo" width="50" height="50" />
      </b-navbar-brand>

      <!-- Navigation items -->
      <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
        <li><router-link to="/" class="nav-link px-2">Home</router-link></li>
        <li><router-link to="/learn" class="nav-link px-2">Learn</router-link></li>
        <li>
          <router-link to="/news-and-events" class="nav-link px-2">News</router-link>
        </li>
        <li>
          <router-link to="/community" class="nav-link px-2">Community</router-link>
        </li>
        <li><router-link to="/help" class="nav-link px-2">Help</router-link></li>
        <li><router-link to="/involved" class="nav-link px-2">Involved</router-link></li>
        <li><router-link to="/about" class="nav-link px-2">About</router-link></li>
      </ul>

      <!-- Login button and Hamburger menu -->
      <div class="col-md-3 text-end">
        <router-link to="/login" class="btn btn-outline-primary me-2">Login</router-link>
        <router-link to="/register" class="btn btn-primary">Register</router-link>
        <b-navbar-toggle target="nav-collapse" class="btn btn-primary">
          <i class="bi bi-list"></i>
        </b-navbar-toggle>
      </div>
    </header>

    <!-- Collapsible nav group for md and smaller screens -->
    <b-collapse id="nav-collapse" class="d-md-none">
      <ul class="nav flex-column">
        <li v-for="item in navItems" :key="item.path" class="nav-item">
          <router-link :to="item.path" class="nav-link">{{ item.name }}</router-link>
        </li>
      </ul>
    </b-collapse>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
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
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}

.nav-header {
  background-color: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 10px 0;
}

.logo {
  position: relative;
  left: 40px;
}

.text-end {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.nav-link {
  color: black;
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
