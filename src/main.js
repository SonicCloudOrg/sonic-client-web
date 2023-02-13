/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { createApp } from 'vue';
import ElementPlus, { ElMessage } from 'element-plus';
import App from './App.vue';
import { setupRouter, router } from './router/index.js';
import store from './store/index.js';
import 'element-plus/dist/index.css';
import axios from './http/axios';
import { setupI18n, $tc } from './locales/setupI18n';

async function initApp() {
  const app = createApp(App);

  // 国际化
  await setupI18n(app);

  // 初始化组件库
  app.use(ElementPlus);

  // 初始化路由
  setupRouter(app);

  // 初始化vuex
  app.use(store);

  app.mount('#app');
}

// 创建应用
initApp().then(() => {
  router.beforeEach((to, from, next) => {
    document.title = $tc('devices.title');
    if (to.meta.title) {
      document.title += ` - ${to.meta.title}`;
    }
    if (to.params.projectId && store.state.project.id === undefined) {
      axios
        .get('/controller/projects', {
          params: {
            id: to.params.projectId,
          },
        })
        .then((resp) => {
          if (resp.code === 2000) {
            store.commit('saveProject', resp.data);
          }
        });
    }
    if (store.state.token.length !== 0 && !store.state.userInfo.userName) {
      axios.get('/controller/users').then((resp) => {
        if (resp.code === 2000) {
          store.commit('setUserInfo', resp.data);
          ElMessage.success({
            message: `${$tc('dialog.welcome')}${store.state.userInfo.userName}`,
          });
          next();
        }
      });
    }
    if (store.state.token.length === 0 && to.path !== '/Login') {
      next({
        path: '/Login',
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  });
});
