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
import AccessDeniedView from '@/views/AccessDeniedView.vue'
import GetMentalHealthCoachView from '@/views/help/CoachView.vue'
import GetMentalHealthProfessionalView from '@/views/help/ProfessionalView.vue'
import {
    useAuth,
} from '@/firebase/authenticate'
import DashboardView from '@/views/admin/DashboardView.vue'
const {
    isAuthenticated,
    login,
    currentRole
} = useAuth()

const routes = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
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
        component: Community,
        meta: {
            requiresAuth: true,
            role: 'user'
        }
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
    },
    {
        path: '/access-denied',
        name: 'AccessDenied',
        component: AccessDeniedView
    },
    {
        path: '/help/get-mental-health-coach',
        name: 'GetMentalHealthCoach',
        component: GetMentalHealthCoachView
    },
    {
        path: '/help/get-mental-health-professional',
        name: 'GetMentalHealthProfessional',
        component: GetMentalHealthProfessionalView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    // requiresAuth and not authenticated
    if (to.meta.requiresAuth && !isAuthenticated.value) {
        console.log("Access denied: Please log in.");
        next('/access-denied');
    }
    // to Community page, authenticated but not user
    else if (to.name === 'Community' && isAuthenticated.value && currentRole.value !== 'user') {
        console.log("Access denied: You do not have the required permissions.");
        next('/access-denied');
    } else {
        next();
    }
});


export default router