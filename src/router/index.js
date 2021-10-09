import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/Index',
    },
    {
        path: '/Index',
        component: () =>
            import ("../views/Index.vue"),
        meta: {title: "首页"},
        children: [
            {
                path: 'Devices',
                component: () =>
                    import ("../views/Devices.vue"),
                meta: {title: "设备中心"}
            },
            {
                path: 'AndroidRemote/:deviceId(\\d+)',
                component: () =>
                    import ("../views/AndroidRemote.vue"),
                meta: {title: "远程控制"}
            },
        ]
    },
    {
        path: '/Home/:projectId(\\d+)',
        component: () =>
            import ("../views/Home.vue"),
        redirect: {name: 'Test'},
        children: [
            {
                path: 'Devices',
                component: () =>
                    import ("../views/Devices.vue"),
                meta: {title: "设备中心"}
            },
            {
                path: 'AndroidRemote/:deviceId(\\d+)',
                component: () =>
                    import ("../views/AndroidRemote.vue"),
                meta: {title: "远程控制"}
            },
            {
                path: 'Test',
                name: 'Test',
                component: () =>
                    import ("../views/Test.vue"),
                meta: {title: "设备中心"}
            },
            {
                path: 'AndroidTestCase',
                name: 'AndroidTestCase',
                component: () =>
                    import ("../views/AndroidTestCase.vue"),
                meta: {title: "安卓测试用例"},
            },
            {
                path: 'StepListView/:caseId(\\d+)',
                name: 'StepListView',
                component: () =>
                    import ("../views/StepListView.vue"),
                meta: {title: "运行步骤"}
            },
            {
                path: 'TestSuites',
                name: 'TestSuites',
                component: () =>
                    import ("../views/TestSuites.vue"),
                meta: {title: "测试套件"}
            },
            {
                path: 'Results',
                name: 'Results',
                component: () =>
                    import ("../views/Results.vue"),
                meta: {title: "测试结果"}
            },
            {
                path: 'ResultDetail/:resultId(\\d+)',
                name: 'ResultDetail',
                component: () =>
                    import ("../views/ResultDetail.vue"),
                meta: {title: "报告详情"}
            },
            {
                path: 'PublicStep',
                name: 'PublicStep',
                component: () =>
                    import ("../views/PublicStep.vue"),
                meta: {title: "公共步骤"}
            },
            {
                path: 'Elements',
                name: 'Elements',
                component: () =>
                    import ("../views/Elements.vue"),
                meta: {title: "控件元素"}
            },
            {
                path: 'GlobalParams',
                name: 'GlobalParams',
                component: () =>
                    import ("../views/GlobalParams.vue"),
                meta: {title: "全局参数"}
            },
            {
                path: 'Modules',
                name: 'Modules',
                component: () =>
                    import ("../views/Modules.vue"),
                meta: {title: "模块管理"}
            },
            {
                path: 'Versions',
                name: 'Versions',
                component: () =>
                    import ("../views/Versions.vue"),
                meta: {title: "版本迭代"}
            },
            {
                path: 'Jobs',
                name: 'Jobs',
                component: () =>
                    import ("../views/Jobs.vue"),
                meta: {title: "定时任务"}
            },
        ]
    }
]

export default createRouter({
    history: createWebHistory(),
    routes,
})