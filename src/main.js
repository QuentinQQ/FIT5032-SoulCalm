import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import router from '@/router'

import {
    createApp
} from 'vue'

import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

createApp(App)
    .use(router)
    .mount("#app");