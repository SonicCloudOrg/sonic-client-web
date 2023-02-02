import { createRouter, createWebHistory } from 'vue-router';
import { $tc } from '@/locales/setupI18n';

const getRoutes = () => [
  {
    path: '/Login',
    component: () => import('../views/Login.vue'),
    meta: { title: $tc('routes.login') },
  },
  {
    path: '/',
    redirect: '/Index',
  },
  {
    path: '/AndroidRemote/:deviceId(\\d+)',
    component: () => import('../views/RemoteEmulator/index.vue'),
    meta: { title: $tc('routes.remoteControl') },
  },
  {
    path: '/IOSRemote/:deviceId(\\d+)',
    component: () => import('../views/RemoteEmulator/indexIOS.vue'),
    meta: { title: $tc('routes.remoteControl') },
  },
  {
    path: '/Index',
    component: () => import('../views/Index.vue'),
    meta: { title: $tc('routes.home') },
    children: [
      {
        path: 'Devices',
        component: () => import('../views/Devices.vue'),
        meta: { title: $tc('routes.deviceCenter') },
      },
      {
        path: 'AndroidRemote/:deviceId(\\d+)',
        component: () => import('../views/RemoteEmulator/index.vue'),
        meta: { title: $tc('routes.remoteControl') },
      },
      {
        path: 'IOSRemote/:deviceId(\\d+)',
        component: () => import('../views/RemoteEmulator/indexIOS.vue'),
        meta: { title: $tc('routes.remoteControl') },
      },
    ],
  },
  {
    path: '/Home/:projectId(\\d+)',
    component: () => import('../views/Home.vue'),
    redirect: { name: 'ProjectIndex' },
    children: [
      {
        path: 'Devices',
        component: () => import('../views/Devices.vue'),
        meta: { title: $tc('routes.deviceCenter') },
      },
      {
        path: 'AndroidRemote/:deviceId(\\d+)',
        component: () => import('../views/RemoteEmulator/index.vue'),
        meta: { title: $tc('routes.remoteControl') },
      },
      {
        path: 'IOSRemote/:deviceId(\\d+)',
        component: () => import('../views/RemoteEmulator/indexIOS.vue'),
        meta: { title: $tc('routes.remoteControl') },
      },
      {
        path: 'AndroidTestCase',
        name: 'AndroidTestCase',
        component: () => import('../views/AndroidTestCase.vue'),
        meta: { title: $tc('routes.androidTestCase') },
      },
      {
        path: 'IOSTestCase',
        name: 'IOSTestCase',
        component: () => import('../views/IOSTestCase.vue'),
        meta: { title: $tc('routes.iosTestCase') },
      },
      {
        path: 'StepListView/:caseId(\\d+)',
        name: 'StepListView',
        component: () => import('../views/StepListView.vue'),
        meta: { title: $tc('routes.operateSteps') },
      },
      {
        path: 'TestSuites',
        name: 'TestSuites',
        component: () => import('../views/TestSuites.vue'),
        meta: { title: $tc('routes.testSuite') },
      },
      {
        path: 'Results',
        name: 'Results',
        component: () => import('../views/Results.vue'),
        meta: { title: $tc('routes.testResult') },
      },
      {
        path: 'ResultDetail/:resultId(\\d+)',
        name: 'ResultDetail',
        component: () => import('../views/ResultDetail.vue'),
        meta: { title: $tc('routes.reportDetails') },
      },
      {
        path: 'PublicStep',
        name: 'PublicStep',
        component: () => import('../views/PublicStep.vue'),
        meta: { title: $tc('routes.publicSteps') },
      },
      {
        path: 'Elements',
        name: 'Elements',
        component: () => import('../views/Elements.vue'),
        meta: { title: $tc('routes.controlElement') },
      },
      {
        path: 'Scripts',
        name: 'Scripts',
        component: () => import('../views/Scripts.vue'),
        meta: { title: $tc('routes.scripts') },
      },
      {
        path: 'GlobalParams',
        name: 'GlobalParams',
        component: () => import('../views/GlobalParams.vue'),
        meta: { title: $tc('routes.globalParameter') },
      },
      {
        path: 'Modules',
        name: 'Modules',
        component: () => import('../views/Modules.vue'),
        meta: { title: $tc('routes.moduleManage') },
      },
      {
        path: 'Versions',
        name: 'Versions',
        component: () => import('../views/Versions.vue'),
        meta: { title: $tc('routes.versionIteration') },
      },
      {
        path: 'Jobs',
        name: 'Jobs',
        component: () => import('../views/Jobs.vue'),
        meta: { title: $tc('routes.timedTask') },
      },
      {
        path: 'ProjectOption',
        name: 'ProjectOption',
        component: () => import('../views/ProjectOption.vue'),
        meta: { title: $tc('routes.projectSetting') },
      },
      {
        path: 'ProjectIndex',
        name: 'ProjectIndex',
        component: () => import('../views/ProjectIndex.vue'),
        meta: { title: $tc('routes.projectPage') },
      },
      {
        path: 'Packages',
        name: 'Packages',
        component: () => import('../views/Packages.vue'),
        meta: { title: $tc('routes.projectPage') },
      },
    ],
  },
  {
    path: '/Setting',
    component: () => import('../views/Setting/Index.vue'),
    redirect: { name: 'Resources' },
    children: [
      {
        path: 'Resources',
        name: 'Resources',
        component: () => import('../views/Setting/Resource.vue'),
        meta: { title: $tc('routes.resource') },
      }, // Role
      {
        path: 'Roles',
        name: 'Roles',
        component: () => import('../views/Setting/Role.vue'),
        meta: { title: $tc('routes.role') },
      },
      {
        path: 'Users',
        name: 'Users',
        component: () => import('../views/Setting/Users.vue'),
        meta: { title: $tc('routes.users') },
      },
      {
        path: 'SysJobs',
        name: 'SysJobs',
        component: () => import('../views/Setting/SysJobs.vue'),
        meta: { title: $tc('routes.sysJobs') },
      },
      {
        path: 'RemoteSettings',
        name: 'RemoteSettings',
        component: () => import('../views/Setting/RemoteSettings.vue'),
        meta: { title: $tc('routes.remoteSettings') },
      },
    ],
  },
];

export let router = null;

export function setupRouter(app) {
  router = createRouter({
    history: createWebHistory(),
    routes: getRoutes(),
  });
  app.use(router);
}
