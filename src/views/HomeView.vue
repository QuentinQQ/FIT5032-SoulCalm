<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="top-section">
        <Swiper :options="swiperOption" class="swiper">
          <SwiperSlide v-for="(image, index) in images" :key="index">
            <img :src="image.src" :alt="image.alt" />
          </SwiperSlide>
        </Swiper>
      </div>
      <div class="bottom-section">
        <h1>Find Nearby Hospitals</h1>
        <div id="map" ref="mapContainer" class="map-container"></div>
        <div class="map-controls">
          <button @click="searchNearbyHospitals">Find Nearby Hospitals</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import p1 from '@/assets/p1.jpeg'
import p2 from '@/assets/p2.jpeg'
import p3 from '@/assets/p3.jpeg'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

const images = ref([
  { src: p1, alt: 'Image 1' },
  { src: p2, alt: 'Image 2' },
  { src: p3, alt: 'Image 3' }
])

const swiperOption = {
  loop: true,
  autoplay: {
    delay: 500,
    disableOnInteraction: false
  },
  pagination: {
    clickable: true
  },
  navigation: true
}

const mapContainer = ref(null)
const map = ref(null)
const userLocation = ref(null)
const directions = ref(null)

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoienFpYTAwMjIiLCJhIjoiY20yNnp1MDduMHFibjJrcHp4NzlsNXQwYSJ9.vyeXz5N4tw9jkXUdxAIySg'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

onMounted(() => {
  initializeMap()
})

const initializeMap = () => {
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 2
  })

  map.value.addControl(new mapboxgl.NavigationControl())

  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
  map.value.addControl(geolocate)

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: {
      color: '#0078A8'
    },
    placeholder: 'Search for a location',
    bbox: [-180, -90, 180, 90],
    types: 'address,poi',
  })

  map.value.addControl(geocoder, 'top-left')

  // 监听搜索结果
  geocoder.on('result', (e) => {
    const { result } = e
    const coordinates = result.geometry.coordinates

    // 添加或更新搜索结果标记
    if (map.value.getSource('search-result')) {
      map.value.getSource('search-result').setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates
          }
        }]
      })
    } else {
      map.value.addSource('search-result', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates
            }
          }]
        }
      })

      map.value.addLayer({
        id: 'search-result',
        type: 'circle',
        source: 'search-result',
        paint: {
          'circle-radius': 10,
          'circle-color': '#0078A8'
        }
      })
    }

    // 将地图视图调整到搜索结果位置
    map.value.flyTo({
      center: coordinates,
      zoom: 14
    })
  })

  directions.value = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    controls: {
      inputs: true,
      instructions: true
    }
  })
  map.value.addControl(directions.value, 'top-left')

  class NearbyHospitalsControl {
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      this._container.innerHTML = '<button class="mapboxgl-ctrl-icon" type="button" title="Find Nearby Hospitals"><span class="mapboxgl-ctrl-icon" aria-hidden="true">🏥</span></button>';
      this._container.onclick = searchNearbyHospitals;
      return this._container;
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    }
  }
  map.value.addControl(new NearbyHospitalsControl(), 'top-right');

  // Get the user's location after the map is loaded.
  map.value.on('load', () => {
    geolocate.trigger()
  })

  // Monitor changes in the user's position
  geolocate.on('geolocate', (e) => {
    userLocation.value = [e.coords.longitude, e.coords.latitude]
  })
}

const searchNearbyHospitals = async () => {
  if (!userLocation.value) {
    alert('User location not available. Please allow location access.')
    return
  }

  const [lng, lat] = userLocation.value
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json?access_token=${MAPBOX_ACCESS_TOKEN}&proximity=${lng},${lat}&limit=5`)
  const data = await response.json()

  // Clear the existing tags
  if (map.value.getLayer('nearby-hospitals')) map.value.removeLayer('nearby-hospitals')
  if (map.value.getSource('nearby-hospitals')) map.value.removeSource('nearby-hospitals')

  // 添加新的医院标记
  map.value.addSource('nearby-hospitals', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.features.map(hospital => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: hospital.center
        },
        properties: {
          title: hospital.text,
          description: hospital.place_name
        }
      }))
    }
  })

  map.value.addLayer({
    id: 'nearby-hospitals',
    type: 'symbol',
    source: 'nearby-hospitals',
    layout: {
      'icon-image': 'hospital-15',
      'icon-allow-overlap': true,
      'text-field': ['get', 'title'],
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0.6],
      'text-anchor': 'top'
    }
  })

  // 添加点击事件以显示弹出窗口和设置导航
  map.value.on('click', 'nearby-hospitals', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice()
    const { title, description } = e.features[0].properties

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<h3>${title}</h3><p>${description}</p><button onclick="setDestination('${description}', [${coordinates}])">Navigate Here</button>`)
      .addTo(map.value)
  })

  // 调整地图视图以显示所有医院
  const bounds = new mapboxgl.LngLatBounds()
  data.features.forEach(feature => bounds.extend(feature.center))
  map.value.fitBounds(bounds, { padding: 50 })
}

// 设置目的地的函数
window.setDestination = (placeName, coordinates) => {
  directions.value.setOrigin(userLocation.value)
  directions.value.setDestination(coordinates)
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding-top: 80px; /* 为固定定位的 header 留出空间 */
}

.content-wrapper {
  max-width: 1200px; /* 或者您想要的任何宽度 */
  width: 100%;
  margin: 0 auto;
  padding: 0 20px; /* 添加一些左右内边距 */
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* 减去 header 的高度 */
}

.top-section {
  flex: 0 0 75%; /* 这里设置轮播图占据 75% 的高度，您可以根据需要调整 */
  margin-bottom: 20px; /* 添加一些底部外边距 */
}

.bottom-section {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.map-container {
  flex: 1;
  width: 100%;
  min-height: 300px; /* 减小最小高度 */
}

.map-controls {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* Mapbox 控件样式保持不变 */

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 10px;
    height: auto; /* 在小屏幕上取消固定高度 */
  }

  .top-section {
    flex: 0 0 50vh; /* 在小屏幕上使用视口高度的 50% */
  }

  .map-container {
    min-height: 250px;
  }

  .mapboxgl-ctrl-geocoder,
  .mapboxgl-ctrl-directions {
    width: 100%;
    min-width: 0;
  }
}
</style>