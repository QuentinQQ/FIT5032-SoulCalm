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

<style>
body {
  margin: 0;
  padding: 0;
  overflow-y: auto !important;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  /* flex: 1;
  padding-top: 80px;
  height: calc(100vh - 80px);
  box-sizing: border-box;
  align-content: center; */
  /* height: calc(100vh - 80px);
  flex: 1;
  padding-top: 80px;
  align-content: center; */
  /* overflow-y: auto; */
  flex: 1;
  padding-top: 80px;
  overflow-y: auto;
  align-content: center;
}
</style>
