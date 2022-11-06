<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import logoT from '../assets/logo.png';
import logo from '../assets/img/logo2.png';
import background from '../assets/img/background.svg';

const { t: $t } = useI18n();

const router = useRouter();
const route = useRoute();
const store = useStore();
const user = ref({
  userName: '',
  password: '',
});
const register = ref({
  userName: '',
  password: '',
  role: 2,
});
const loginForm = ref(null);
const configLoading = ref(true);
const config = ref({
  registerEnable: false,
  normalEnable: false,
  ldapEnable: false,
});
const getLoginConfig = () => {
  axios.get('/controller/users/loginConfig').then((resp) => {
    if (resp.code === 2000) {
      configLoading.value = false;
      config.value = resp.data;
    }
  });
};
const loginPost = (u) => {
  loading.value = true;
  axios.post('/controller/users/login', u).then((resp) => {
    loading.value = false;
    if (resp.code === 2000) {
      store.commit('changeLogin', resp.data);
      if (route.query.redirect) {
        const { redirect } = route.query;
        router.replace(redirect);
      } else {
        router.replace({ path: '/' });
      }
    }
  });
};
const login = () => {
  loginForm.value.validate(async (valid) => {
    if (valid) {
      await store.commit('clearAuth');
      await loginPost(user.value);
    }
  });
};
const registerForm = ref(null);
const registerIn = () => {
  registerForm.value.validate(async (valid) => {
    if (valid) {
      await store.commit('clearAuth');
      loading.value = true;
      await axios
        .post('/controller/users/register', register.value)
        .then((resp) => {
          loading.value = false;
          if (resp.code === 2000) {
            ElMessage.success({
              message: resp.message,
            });
            loginPost({
              userName: register.value.userName,
              password: register.value.password,
            });
          }
        });
    }
  });
};
const loading = ref(false);
onMounted(() => {
  getLoginConfig();
});
</script>

<template>
  <img
    class="play1"
    style="position: absolute; right: 40px; top: 20px; z-index: 9999"
    :src="logoT"
    width="120"
  />
  <img
    class="play2"
    style="position: absolute; right: 30px; top: 180px; z-index: 9999"
    :src="logoT"
    width="40"
  />
  <img
    class="play3"
    style="position: absolute; right: 180px; top: 40px; z-index: 9999"
    :src="logoT"
    width="60"
  />
  <img
    class="play4"
    style="position: absolute; right: 120px; top: 140px; z-index: 9999"
    :src="logoT"
    width="50"
  />
  <div
    class="login"
    :style="
      'background:  url(' +
      background +
      ');background-repeat:no-repeat; background-size:60% 60%;background-origin: content-box;background-position: left bottom;'
    "
  >
    <el-card
      style="width: 550px"
      body-style="background-color:#FFFFFF;text-align:center;position:relative"
    >
      <img :src="logo" width="270" />
      <el-divider class="device-card-divider">{{
        $t('loginTS.testPlatform')
      }}</el-divider>
      <el-tabs
        v-loading="configLoading"
        type="border-card"
        stretch
        style="margin-top: 30px"
      >
        <el-tab-pane
          :label="
            config.normalEnable && config.ldapEnable
              ? $t('loginTS.login.message')
              : config.normalEnable
              ? $t('loginTS.login.register')
              : config.ldapEnable
              ? $t('loginTS.login.LDAPLogin')
              : ''
          "
        >
          <el-form
            ref="loginForm"
            style="margin-top: 10px"
            :model="user"
            size="small"
            @keyup.enter.native="login"
          >
            <el-form-item prop="username">
              <el-input
                v-model="user.userName"
                prefix-icon="el-icon-user"
                :placeholder="$t('loginTS.user.inputUserName')"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="user.password"
                prefix-icon="el-icon-lock"
                type="password"
                show-password
                :placeholder="$t('loginTS.user.inputPassword')"
              ></el-input>
            </el-form-item>
            <el-button
              size="small"
              type="primary"
              style="width: 100%"
              :loading="loading"
              @click="login"
              >{{ $t('loginTS.user.longin') }}
            </el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane
          v-if="config.registerEnable"
          :label="$t('loginTS.user.register')"
        >
          <el-form
            ref="registerForm"
            style="margin-top: 10px"
            :model="register"
            size="small"
          >
            <el-form-item prop="username">
              <el-input
                v-model="register.userName"
                prefix-icon="el-icon-user"
                :placeholder="$t('loginTS.user.inputUserName')"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="register.password"
                prefix-icon="el-icon-lock"
                type="password"
                show-password
                :placeholder="$t('loginTS.user.inputPassword')"
              ></el-input>
            </el-form-item>
            <!-- <el-form-item prop="password">
              <el-select style="width: 100%;" v-model="register.role">
                <el-option label="测试工程师" :value="2"></el-option>
                <el-option label="开发工程师" :value="3"></el-option>
              </el-select>
            </el-form-item> -->
            <el-button
              size="small"
              type="primary"
              style="width: 100%"
              :loading="loading"
              @click="registerIn"
              >{{ $t('loginTS.user.register') }}
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style>
.play1 {
  animation: bounce-down 1.8s linear infinite;
}

.play2 {
  animation: bounce-down 1.6s linear infinite;
}

.play3 {
  animation: bounce-down 1.3s linear infinite;
}

.play4 {
  animation: bounce-down 1.5s linear infinite;
}

@-webkit-keyframes bounce-down {
  25% {
    -webkit-transform: translateY(-10px);
  }
  50%,
  100% {
    -webkit-transform: translateY(0);
  }
  75% {
    -webkit-transform: translateY(10px);
  }
}
</style>
