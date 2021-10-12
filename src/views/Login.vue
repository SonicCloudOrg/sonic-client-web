<script setup>
import background from "../../src/assets/img/background.svg";
import logo from "../../src/assets/img/logo2.png";
import {ref} from "vue";

const user = ref({
  username: "",
  password: ""
})
const register = ref({
  username: "",
  password: "",
  role: 1
})
const loading = ref(false)
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
              ref="form"
              :model="user"
              size="small"
              @keyup.enter.native="loginIn(user)"
          >
            <el-form-item prop="username">
              <el-input
                  prefix-icon="el-icon-user"
                  v-model="user.username"
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
                @click="loginIn(user)"
                :loading="loading"
            >登 入
            </el-button
            >
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注 册">
          <el-form
              style="margin-top: 10px"
              ref="form"
              :model="user"
              size="small"
              @keyup.enter.native="loginIn(user)"
          >
            <el-form-item prop="username">
              <el-input
                  prefix-icon="el-icon-user"
                  v-model="user.username"
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
                @click="loginIn(user)"
                :loading="loading"
            >注册
            </el-button
            >
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
