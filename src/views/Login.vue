<script setup>
import background from "../../src/assets/img/background.svg";
import logo from "../../src/assets/img/logo2.png";
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
  <div
      class="login"
      :style="
      'background: linear-gradient(to bottom right, rgba(255, 255, 255, 0), rgba(189, 218, 248, 1)), url(' +
      background +
      ');background-size:cover'
    "
  >
    <el-card
        style="width: 550px;"
        body-style="background-color:#FFFFFF;text-align:center;position:relative"
    >
      <img :src="logo" width="270"/>
      <el-divider class="device-card-divider">云真机测试平台</el-divider>
      <el-tabs type="border-card" stretch style="margin-top: 30px">
        <el-tab-pane label="登 录">
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
