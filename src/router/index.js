import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/Home',
    },
    {
        path: '/Home',
        component: () =>
            import ("../components/Home.vue"),
    },
    {
        path: '/Home/:projectId(\\d+)',
        component: () =>
            import ("../components/Home.vue"),
        redirect: {name: 'Test'},
        meta: {title: "首页"},
        children: [
            {
                path: 'Devices',
                name: 'Devices',
                component: () =>
                    import ("../components/Devices.vue"),
                meta: {title: "设备中心"}
            },
            {
                path: 'Test',
                name: 'Test',
                component: () =>
                    import ("../components/Test.vue"),
                meta: {title: "设备中心"}
            }
        ]
    }
]

export default createRouter({
    history: createWebHistory(),
    routes,
})