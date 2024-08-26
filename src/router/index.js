import {
    createRouter,
    createWebHistory
} from 'vue-router'
import Home from '@/views/HomeView.vue'
import About from '@/views/AboutView.vue'
import Community from '@/views/CommunityView.vue'
import HelpView from '@/views/HelpView.vue'
import InvolvedView from '@/views/InvolvedView.vue'
import LearnView from '@/views/LearnView.vue'
import NewsAndEventsView from '@/views/NewsAndEventsView.vue'
import LoginView from '@/views/authentication/LoginView.vue'
import RegisterView from '@/views/authentication/RegisterView.vue'


const routes = [{
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/community',
        name: 'Community',
        component: Community
    },
    {
        path: '/help',
        name: 'Help',
        component: HelpView
    },
    {
        path: '/involved',
        name: 'Involved',
        component: InvolvedView
    },
    {
        path: '/learn',
        name: 'Learn',
        component: LearnView
    },
    {
        path: '/news-and-events',
        name: 'NewsAndEvents',
        component: NewsAndEventsView
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router