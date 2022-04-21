/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import {createApp} from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus';
import store from './store/index.js'
import 'element-plus/dist/index.css'
import axios from "./http/axios";
import {ElMessage} from 'element-plus'
import {setupI18n} from './locales/setupI18n'

async function initApp() {
  const app = createApp(App)

  // 初始化组件库
  app.use(ElementPlus)

  // 初始化路由
  app.use(router)

  // 初始化vuex
  app.use(store)

  // 国际化
  await setupI18n(app)

  app.mount('#app')
}

// 创建应用
initApp()

router.beforeEach((to, from, next) => {
    document.title = "Sonic云真机测试平台 -"
    if (to.meta['title']) {
        document.title += " " + to.meta['title']
    }
    if (to.params.projectId && store.state.project.id === undefined) {
        axios
            .get("/controller/projects", {
                params: {
                    id: to.params.projectId,
                },
            })
            .then((resp) => {
                if (resp['code'] === 2000) {
                    store.commit("saveProject", resp.data);
                }
            });
    }
    if (store.state.token.length !== 0 && !store.state.userInfo.userName) {
        axios.get("/controller/users").then((resp) => {
            if (resp['code'] === 2000) {
                store.commit("setUserInfo", resp.data);
                ElMessage.success({
                    message: '欢迎回来！' + store.state.userInfo.userName,
                });
                next();
            }
        });
    }
    if (store.state.token.length === 0 && to.path !== '/Login') {
        next({
            path: '/Login',
            query: { redirect: to.fullPath }
        })
    } else {
        next();
    }
})