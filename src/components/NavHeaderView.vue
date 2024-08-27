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
      </ul>

      <!-- Login and Register buttons -->
      <div class="d-flex">
        <router-link to="/login" class="btn btn-outline-primary me-2">Login</router-link>
        <router-link to="/register" class="btn btn-primary">Register</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
// 无需额外的脚本部分
</script>

<style scoped>
/* 在这里保留之前的样式 */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 10px 0;
  background-color: #f8f9fa;
}

.logo {
  position: relative;
  left: 40px;
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
