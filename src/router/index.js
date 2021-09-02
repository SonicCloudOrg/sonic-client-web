import { createRouter, createWebHistory } from 'vue-router';

const routes = [{
        path: '/Devices',
        component: () =>
            import ("../views/Devices.vue"),
        meta: { title: "设备中心" }
    },
    // {
    //     path: '/',
    //     redirect: '/Home'
    // }
]

export default createRouter({
    history: createWebHistory(),
    routes,
})