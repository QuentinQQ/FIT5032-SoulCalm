import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import router from '@/router';
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';


import {
    createApp
} from 'vue'

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(router);
app.mount("#app");