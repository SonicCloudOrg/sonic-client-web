import {createApp} from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus';
import store from './store/index.js'
import 'element-plus/dist/index.css'
import axios from "./http/axios";
import {ElMessage} from 'element-plus'

createApp(App).use(ElementPlus).use(router).use(store).mount('#app')

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