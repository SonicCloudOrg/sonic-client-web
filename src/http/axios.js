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
import axios from 'axios'
import {ElMessage} from 'element-plus'
import {router} from '../router/index.js'
import {i18n} from '@/locales/setupI18n'

let baseURL = '';
if (process.env.NODE_ENV === 'development') {
    baseURL = "http://localhost:8094/api"
}
if (process.env.NODE_ENV === 'production') {
    baseURL = "http://SERVER_HOST:SONIC_GATEWAY_PORT/api"
}
const $http = axios.create();
$http.defaults.baseURL = baseURL
// $http.defaults.timeout = 20000;
$http.defaults.headers['common']['X-Requested-With'] = 'XMLHttpRequest';
$http.defaults.withCredentials = true;

$http.interceptors.request.use(
    config => {
        config.headers = {
            'Content-Type': 'application/json',
            'Accept-Language': i18n.global.locale.value
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
                router.replace({path: "/Login", query: {redirect: router.currentRoute.value.path}}).catch(err => {
                });
            }
            localStorage.removeItem('SonicToken');
            break;
        default:
            if (response.data.message) {
                ElMessage.error({
                    message: response.data.message,
                });
            }
    }
    return response.data;
}, err => {
    ElMessage.error({
        message: '系统出错了！',
    });
    return Promise.reject(err);
});

export default $http
