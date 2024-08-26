<template>
  <div>
    <header position:sticky>
      <!-- 导航栏 -->
      <b-navbar
        class="nav d-flex justify-content-between align-items-center"
        type="dark"
        variant="info"
      >
        <!-- 左边的品牌 logo -->
        <b-navbar-brand href="#">
          <img src="@/assets/logo.png" alt="SoulCalm Logo" width="30" height="30" />
        </b-navbar-brand>

        <!-- 中间的导航项 -->
        <b-navbar-nav class="flex-grow-1 justify-content-center">
          <b-nav-item>
            <router-link to="/">Home</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/learn">Learn About Mental Health</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/news-and-events">News and Events</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/community">Community</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/help">Get Help Now</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/involved">Get Involved</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/about">About Us</router-link>
          </b-nav-item>
        </b-navbar-nav>

        <!-- 右侧的登录按钮和汉堡菜单 -->
        <div class="d-flex align-items-center">
          <!-- 登录按钮 -->
          <b-nav-item>
            <router-link to="/login">Login</router-link>
          </b-nav-item>

          <!-- 汉堡菜单按钮（小屏幕时显示） -->
          <b-navbar-toggle target="nav-collapse" class="ml-2">
            <i class="bi bi-list"></i>
          </b-navbar-toggle>
        </div>
      </b-navbar>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup></script>

<style></style>

<style>
header {
  position: fixed;
  top: 20px;
  left: 0px;
  width: 100%;
  z-index: 1000;
}

.nav {
  flex-wrap: nowrap;
}

.nav a {
  white-space: nowrap;
}

.nav-item {
  padding: 0 10px;
}
</style>
