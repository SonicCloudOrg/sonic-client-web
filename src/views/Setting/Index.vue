<script setup>
import {onMounted} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import Header from "@/components/Header.vue"
import defaultLogo from '@/assets/logo.png'

const store = useStore();
const route = useRoute();
onMounted(() => {
  const windowWidth = document.body.clientWidth;
  if (windowWidth < 1200) {
    store.commit("autoChangeCollapse");
  }
})
</script>

<template>
  <el-container>
    <el-aside width="auto">
        <el-menu
          style="padding-top: 15px"
          :background-color="store.state.menuBack"
          :text-color="store.state.menuText"
          :active-text-color="store.state.menuActiveText"
          :collapse="store.state.isCollapse"
          :default-active="route.path"
          :unique-opened="true"
          class="el-menu-vertical-demo font"
          router>
          <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-lock"></i>
            <span>权限管理</span>
          </template>
          <el-menu-item :index="'/Setting/Resources'">
            <i class="el-icon-thumb"></i>资源管理
          </el-menu-item>
          <el-menu-item :index="'/Setting/Roles'">
            <i class="el-icon-star-off"></i>角色管理
          </el-menu-item>
          <el-menu-item :index="'/Setting/Users'">
            <i class="el-icon-user"></i>用户角色配置
          </el-menu-item>
        </el-sub-menu>
        </el-menu>
    </el-aside>
    <Header></Header>
  </el-container>
</template>