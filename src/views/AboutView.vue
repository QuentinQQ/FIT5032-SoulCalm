<template>
  <div class="about-container">
    <div class="blue-container">
      <div class="about-content">
        <div class="text-section">
          <h1>{{ aboutInfo.title }}</h1>
          <p>{{ aboutInfo.description }}</p>
        </div>
        <div class="image-section">
          <img src="@/assets/couple-looking-outward.svg" alt="Couple looking outward" />
        </div>
      </div>
    </div>
    <div class="white-container">
      <div class="about-content">
        <div class="text-section">
          <p>{{ aboutInfo.description1 }}</p>
          <p>{{ aboutInfo.description2 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import aboutInfoJson from '@/data/about-info.json'

const aboutInfo = ref({})

onMounted(() => {
  loadAboutInfo()
})

const loadAboutInfo = () => {
  aboutInfo.value = aboutInfoJson
}
</script>

<style scoped>
.about-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: top;
  width: 100%;
  height: 100%;
}

.blue-container {
  background-color: #eef3fc;
  display: flex;
  align-items: center;
  padding: 40px;
  width: 100%;
  height: 400px;
}

.about-content {
  display: flex;
  align-items: center;
  padding: 40px;
  width: 100%;
  max-width: 1000px;
  height: 400px;
  margin: 0 auto;
}

.white-container {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 40px;
  width: 100%;
  height: 400px;
}

.text-section {
  flex: 1;
  padding: 20px;
}

.text-section h1 {
  font-size: 2rem;
  color: #1a3e72;
}

.text-section p {
  font-size: 1rem;
  color: #4f5d75;
  margin-top: 10px;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-section img {
  max-width: 100%;
  height: auto;
}
</style>
