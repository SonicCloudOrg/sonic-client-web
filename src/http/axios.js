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
import axios from 'axios';
import qs from 'qs';
import { ElMessage } from 'element-plus';
import { i18n, $tc } from '@/locales/setupI18n';
import { router } from '../router/index.js';

let baseURL = '';
if (process.env.NODE_ENV === 'development') {
  baseURL = 'http://localhost:3000/server/api';
}
if (process.env.NODE_ENV === 'production') {
  baseURL = 'http://SONIC_SERVER_HOST:SONIC_SERVER_PORT/server/api';
}
const $http = axios.create();
baseURL = baseURL.replace(':80/', '/');
$http.defaults.baseURL = baseURL;
// $http.defaults.timeout = 20000;
$http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
$http.defaults.withCredentials = true;
$http.defaults.paramsSerializer = (params) =>
  qs.stringify(params, { arrayFormat: 'brackets' });

$http.interceptors.request.use(
  (config) => {
    config.headers = {
      'Content-Type': 'application/json',
      'Accept-Language': i18n.global.locale.value,
    };
    if (localStorage.getItem('SonicToken')) {
      config.headers.SonicToken = localStorage.getItem('SonicToken');
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

$http.interceptors.response.use(
  (response) => {
    switch (response.data.code) {
      case 2000:
        break;
      case 1001:
        if (router.currentRoute.value.path !== '/Login') {
          router
            .replace({
              path: '/Login',
              query: { redirect: router.currentRoute.value.path },
            })
            .catch((err) => {});
        }
        localStorage.removeItem('SonicToken');
        break;
      case 1003:
        ElMessage.error({
          message: $tc('dialog.permissionDenied'),
        });
        break;
      default:
        if (response.data.message) {
          ElMessage.error({
            message: response.data.message,
          });
        }
    }
    return response.data;
  },
  (err) => {
    if (err.response.status === 503) {
      ElMessage.info({
        message: $tc('dialog.ready'),
      });
    } else {
      ElMessage.error({
        message: $tc('dialog.error'),
      });
    }
    return Promise.reject(err);
  }
);

export default $http;
