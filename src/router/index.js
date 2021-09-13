import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/Home'
    },
    {
        path: '/Home',
        component: () =>
            import ("../components/Home.vue"),
        meta: {title: "首页"},
        children: [
            {
                path: 'Devices',
                name: 'Devices',
                component: () =>
                    import ("../components/Devices.vue"),
                meta: {title: "设备中心"}
            }
        ]
    },
    {
        path: '/Home/:projectId',
        component: () =>
            import ("../components/Home.vue"),
        redirect: '/Home/:projectId/Devices',
        children: [
            {
                path: 'Devices',
                name: 'Devices',
                component: () =>
                    import ("../components/Devices.vue"),
                meta: {title: "设备中心"}
            }]
    },
    {
        path: '/Empty/:projectId',
        component: () =>
            import ("../components/Empty.vue"),
    },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})