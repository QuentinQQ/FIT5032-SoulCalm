<template>
  <div class="app-container">
    <HeaderView />
    <main>
      <div class="content-container">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import HeaderView from './components/NavHeaderView.vue'
</script>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}

.main-container {
  width: 100%;
  padding-top: 80px;
}
</style>
