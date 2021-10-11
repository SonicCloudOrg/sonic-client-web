import axios from 'axios'
import {ElMessage} from 'element-plus'
import router from '../router/index.js'

let baseURL = '';
if (process.env.NODE_ENV === 'development') {
    baseURL = "http://localhost:8094/api"
}
if (process.env.NODE_ENV === 'production') {
    baseURL = "http://localhost:8094/api"
}
const $http = axios.create();
$http.defaults.baseURL = baseURL
$http.defaults.timeout = 20000;
$http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
$http.defaults.withCredentials = true;

$http.interceptors.request.use(
    config => {
        config.headers = {
            'Content-Type': 'application/json'
        }
        if (localStorage.getItem('SonicToken')) {
            config.headers.SonicToken = localStorage.getItem('SonicToken');
        }
        return config;
    },
    err => {
        return Promise.reject(err)
    }
)

$http.interceptors.response.use(response => {
    switch (response.data.code) {
        case 2000:
            break;
        case 1001:
            if (router.currentRoute.value.path !== '/Login') {
                router.replace({path: "/Login"}).catch(err => {
                });
            }
            localStorage.removeItem('SonicToken');
            if (response.data.message) {
                ElMessage.error({
                    message: response.data.message,
                })
            }
            ;
            break;
        default:
            if (response.data.message) {
                ElMessage.error({
                    message: response.data.message,
                })
            }
            ;
    }
    return response.data;
}, err => {
    if (err.response) {
        switch (err.response.status) {
            case 401:
                break;
            default:
                ElMessage.error({
                    message: '系统出错了！',
                });
                break;
        }
    } else {
        ElMessage.error({
            message: '系统出错了！',
        });
    }
    return Promise.reject(err);
});

export default $http