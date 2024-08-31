<template>
  <div class="container">
    <Swiper :options="swiperOption">
      <SwiperSlide v-for="(image, index) in images" :key="index">
        <img :src="image.src" :alt="image.alt" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import p1 from '@/assets/p1.jpeg'
import p2 from '@/assets/p2.jpeg'
import p3 from '@/assets/p3.jpeg'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'

const images = ref([
  { src: p1, alt: 'Image 1' },
  { src: p2, alt: 'Image 2' },
  { src: p3, alt: 'Image 3' }
])

const swiperOption = {
  loop: true, // 启用循环
  autoplay: {
    delay: 500, // 每次切换的延迟时间（毫秒）
    disableOnInteraction: false // 用户操作后是否停止自动播放，false 表示不会停止
  },
  pagination: {
    clickable: true // 启用并使分页器可点击
  },
  navigation: true
}
</script>

<style scoped>
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
