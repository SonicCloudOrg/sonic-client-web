import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus';
import store from './store/index.js'
import 'element-plus/dist/index.css'
import axios from "./http/axios";
import { ElMessage } from 'element-plus'

createApp(App).use(ElementPlus).use(router).use(store).mount('#app')

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = "Sonic-UI自动化测试平台 - " + to.meta.title
    }
    if (!store.state.userInfo.token && store.state.userInfo.token.length !== 0) {
        axios.get("/user").then((res) => {
            if (res.data.code === 2000) {
                store.commit("setUserInfo", res.data.data);
                ElMessage.success({
                    message: '欢迎回来！' + store.state.userInfo.name,
                });
                next();
            }
        });
    } else {
        next();
    }
})