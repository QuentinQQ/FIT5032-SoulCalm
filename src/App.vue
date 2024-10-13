<template>
  <div id="app">
    <div><NavHeaderView /></div>
    <div class="main-content"><router-view></router-view></div>
  </div>
  <FooterView></FooterView>
</template>

<script setup>
import { ref } from 'vue'
import NavHeaderView from './components/NavHeaderView.vue'
import FooterView from './components/FooterView.vue'
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
  height: calc(100vh - 80px);
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
