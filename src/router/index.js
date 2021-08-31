import { createRouter, createWebHistory } from 'vue-router';

const routes = [{
        path: '/Home',
        component: () =>
            import ("../views/Home.vue"),
    },
    {
        path: '/',
        redirect: '/Home'
    }
]

export default createRouter({
    history: createWebHistory(),
    routes,
})