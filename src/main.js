import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import router from '@/router'
import {
    createApp
} from 'vue'
import App from './App.vue'

createApp(App)
    .use(router)
    .mount('#app')