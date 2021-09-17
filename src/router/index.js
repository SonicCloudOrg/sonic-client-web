import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/Index',
    },
    {
        path: '/Index',
        component: () =>
            import ("../components/Index.vue"),
        meta: {title: "首页"},
        // redirect: '/Index/Devices',
        children: [
            {
                path: 'Devices',
                component: () =>
                    import ("../components/Devices.vue"),
                meta: {title: "设备中心"}
            },
            {
                path: 'AndroidRemote/:deviceId(\\d+)',
                component: () =>
                    import ("../components/AndroidRemote.vue"),
                meta: {title: "远程控制"}
            },
        ]
    },
    {
        path: '/Home/:projectId(\\d+)',
        component: () =>
            import ("../components/Home.vue"),
        redirect: {name: 'Test'},
        children: [
            {
                path: 'Devices',
                component: () =>
                    import ("../components/Devices.vue"),
                meta: {title: "设备中心"}
            },
            {
                path: 'AndroidRemote/:deviceId(\\d+)',
                component: () =>
                    import ("../components/AndroidRemote.vue"),
                meta: {title: "远程控制"}
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