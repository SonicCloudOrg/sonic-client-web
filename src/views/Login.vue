<script setup>
import background from "../../src/assets/img/background.svg";
import logo from "../../src/assets/img/logo2.png";
import logoT from "../../src/assets/logo.png";
import pad from "../../src/assets/img/pad.png";
import phone from "../../src/assets/img/phone.png";
import watch from "../../src/assets/img/watch.png";
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";

const router = useRouter()
const route = useRoute()
const store = useStore()
const user = ref({
  userName: "",
  password: ""
})
const register = ref({
  userName: "",
  password: "",
  role: 2
})
const loginForm = ref(null)
const loginPost = (u) => {
  loading.value = true
  axios.post("/controller/users/login", u).then(resp => {
    loading.value = false
    if (resp['code'] === 2000) {
      store.commit("changeLogin", resp.data);
      if (route.query.redirect) {
        let redirect = route.query.redirect;
        router.replace(redirect);
      } else {
        router.replace({path: "/"});
      }
    }
  })
}
const login = () => {
  loginForm['value'].validate(async (valid) => {
    if (valid) {
      await store.commit("clearAuth");
      await loginPost(user.value)
    }
  })
}
const registerForm = ref(null)
const registerIn = () => {
  registerForm['value'].validate(async (valid) => {
    if (valid) {
      await store.commit("clearAuth");
      loading.value = true
      await axios.post("/controller/users/register", register.value).then(resp => {
        loading.value = false
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          loginPost({userName: register.value.userName, password: register.value.password})
        }
      })
    }
  })
}
const loading = ref(false)
onMounted(() => {
  ElMessage.error({
    message: '请先登录！',
  });
})
</script>
<template>
  <img class="play1" style="position: absolute;right: 40px;top:20px;z-index:9999" :src="logoT" width="120"/>
  <img class="play2" style="position: absolute;right: 30px;top:180px;z-index:9999" :src="logoT" width="40"/>
  <img class="play3" style="position: absolute;right: 180px;top:40px;z-index:9999" :src="logoT" width="60"/>
  <img class="play4" style="position: absolute;right: 120px;top:140px;z-index:9999" :src="logoT" width="50"/>
  <img class="play5" style="position: absolute;left: 280px;top:40px;z-index:9999" :src="watch" width="120"/>
  <img class="play6" style="position: absolute;right: 180px;bottom:40px;z-index:9999" :src="phone" width="190"/>
  <img class="play7" style="position: absolute;left: 30px;top:200px;z-index:9999" :src="pad" width="190"/>
  <div
      class="login"
      :style="
      'background:  url(' +
      background +
      ');background-repeat:no-repeat; background-size:60% 60%;background-origin: content-box;background-position: left bottom;'
    "
  >
    <el-card
        style="width: 550px;"
        body-style="background-color:#FFFFFF;text-align:center;position:relative"
    >
      <img :src="logo" width="270"/>
      <el-divider class="device-card-divider">一站式云真机测试平台</el-divider>
      <el-tabs type="border-card" stretch style="margin-top: 30px">
        <el-tab-pane label="注册账号/域账号登录">
          <el-form
              style="margin-top: 10px"
              ref="loginForm"
              :model="user"
              size="small"
              @keyup.enter.native="login"
          >
            <el-form-item prop="username">
              <el-input
                  prefix-icon="el-icon-user"
                  v-model="user.userName"
                  placeholder="请输入账户名"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                  prefix-icon="el-icon-lock"
                  type="password"
                  show-password
                  v-model="user.password"
                  placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <el-button
                size="small"
                type="primary"
                style="width: 100%"
                @click="login"
                :loading="loading"
            >登 入
            </el-button
            >
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注 册">
          <el-form
              style="margin-top: 10px"
              ref="registerForm"
              :model="register"
              size="small"
          >
            <el-form-item prop="username">
              <el-input
                  prefix-icon="el-icon-user"
                  v-model="register.userName"
                  placeholder="请输入账户名"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                  prefix-icon="el-icon-lock"
                  type="password"
                  show-password
                  v-model="register.password"
                  placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-select style="width: 100%;" v-model="register.role">
                <el-option label="测试工程师" :value="2"></el-option>
                <el-option label="开发工程师" :value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-button
                size="small"
                type="primary"
                style="width: 100%"
                @click="registerIn"
                :loading="loading"
            >注 册
            </el-button
            >
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
  50%, 100% {
    -webkit-transform: translateY(0);
  }
  75% {
    -webkit-transform: translateY(10px);
  }
}
</style>
